// Server entry point for Android 16 Dashboard
// Uses configuration from ./config.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// -------------------------------------------------------------------
// Express app setup
// -------------------------------------------------------------------
const app = express();
app.use(cors(config.cors));
app.use(express.json()); // body parser for AI endpoint
// Serve photos from public directory (configured in .env or defaults)
app.use('/photos', express.static(path.join(config.server.publicDir, 'photos')));

// -------------------------------------------------------------------
// AI Agent integration
// -------------------------------------------------------------------
const allowedAgents = {
  gemini: { command: 'gemini', args: ['-p'] },
  qwen: { command: 'qwen-cli', args: ['-p'] },
  kilocode: { command: 'kilocode', args: ['-p'] }
};

function runAgent(agentName, prompt) {
  return new Promise((resolve, reject) => {
    const agent = allowedAgents[agentName];
    if (!agent) return reject(new Error('Agent not allowed'));
    // Build command string safely – escape double quotes in prompt
    const safePrompt = prompt.replace(/"/g, '\\"');
    const fullCmd = `${agent.command} ${agent.args.join(' ')} "${safePrompt}"`;
    exec(fullCmd, { cwd: path.resolve(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(new Error(stderr));
      resolve(stdout.trim());
    });
  });
}

app.post('/api/agent', async (req, res) => {
  const { agent, prompt } = req.body;
  if (!agent || !prompt) {
    return res.status(400).json({ error: 'Missing agent or prompt' });
  }
  try {
    const result = await runAgent(agent, prompt);
    res.json({ response: result });
  } catch (e) {
    console.error('Agent error:', e);
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------------------------------------
// HTTP & Socket.IO server
// -------------------------------------------------------------------
const server = http.createServer(app);
const io = new Server(server, { cors: config.cors });

// -------------------------------------------------------------------
// Device status tracking
// -------------------------------------------------------------------
let deviceStatus = {
  connected: false,
  model: 'Unknown',
  battery: null,
  cpuTemp: null,
  ram: { total: 0, used: 0, free: 0 }
};

// -------------------------------------------------------------------
// ADB monitoring – checks if a device is attached
// -------------------------------------------------------------------
function checkDevice() {
  const adb = spawn(config.adb.path, ['devices']);
  let output = '';
  adb.stdout.on('data', data => (output += data.toString()));
  adb.on('close', () => {
    const lines = output.split('\n');
    const deviceLine = lines.find(l => l.includes('device') && !l.includes('List of devices'));
    if (deviceLine) {
      if (!deviceStatus.connected) {
        console.log('📱 Device Connected!');
        deviceStatus.connected = true;
        deviceStatus.model = deviceLine.split('\t')[0];
        io.emit('status', deviceStatus);
        fetchDeviceStats();
      }
    } else {
      if (deviceStatus.connected) {
        console.log('🔌 Device Disconnected');
        deviceStatus.connected = false;
        deviceStatus.battery = null;
        io.emit('status', deviceStatus);
      }
    }
  });
}

// -------------------------------------------------------------------
// SSH based stats collection (model, battery, RAM, CPU temp)
// -------------------------------------------------------------------
function fetchDeviceStats() {
  if (!deviceStatus.connected) return;
  if (!config.ssh.privateKeyPath) {
    console.warn('⚠️  SSH not configured, skipping stats fetch');
    return;
  }
  const conn = new Client();
  conn.on('ready', () => {
    // Model
    conn.exec('getprop ro.product.model', (err, stream) => {
      if (!err) {
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          deviceStatus.model = buf.trim() || 'Unknown';
          io.emit('status', deviceStatus);
        });
      }
    });
    // Battery level
    conn.exec('cat /sys/class/power_supply/battery/capacity', (err, stream) => {
      if (!err) {
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          const lvl = parseInt(buf.trim());
          if (!isNaN(lvl)) {
            deviceStatus.battery = lvl;
            io.emit('status', deviceStatus);
          }
        });
      }
    });
    // Battery status (charging/discharging)
    conn.exec('cat /sys/class/power_supply/battery/status', (err, stream) => {
      if (!err) {
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          deviceStatus.batteryStatus = buf.trim();
          io.emit('status', deviceStatus);
        });
      }
    });
    // RAM usage
    conn.exec('free -m', (err, stream) => {
      if (!err) {
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          const lines = buf.split('\n');
          if (lines.length > 1) {
            const parts = lines[1].trim().split(/\s+/);
            if (parts.length >= 4) {
              deviceStatus.ram = {
                total: parseInt(parts[1]),
                used: parseInt(parts[2]),
                free: parseInt(parts[3])
              };
              io.emit('status', deviceStatus);
            }
          }
        });
      }
    });
    // CPU temperature (if available)
    conn.exec('cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "N/A"', (err, stream) => {
      if (!err) {
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          const temp = parseInt(buf.trim());
          if (!isNaN(temp)) {
            deviceStatus.cpuTemp = Math.round(temp / 1000);
            io.emit('status', deviceStatus);
          }
        });
      }
    });
    conn.end();
  }).on('error', err => {
    console.error('❌ SSH Connection failed:', err.message);
    console.error('   Ensure SSH is configured in .env and port is forwarded');
  }).connect({
    host: config.ssh.host,
    port: config.ssh.port,
    username: config.ssh.username,
    privateKey: fs.readFileSync(config.ssh.privateKeyPath)
  });
}

function executeSSHCommand(command) {
  return new Promise((resolve, reject) => {
    if (!config.ssh.privateKeyPath) {
      return reject(new Error('SSH not configured. Please set SSH_KEY_PATH in .env'));
    }
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let buf = '';
        stream.on('data', d => (buf += d));
        stream.on('close', () => {
          conn.end();
          resolve(buf);
        });
        stream.stderr.on('data', d => console.error('SSH stderr:', d.toString()));
      });
    }).on('error', reject).connect({
      host: config.ssh.host,
      port: config.ssh.port,
      username: config.ssh.username,
      privateKey: fs.readFileSync(config.ssh.privateKeyPath)
    });
  });
}

// -------------------------------------------------------------------
// Startup actions
// -------------------------------------------------------------------
checkDevice();
setInterval(checkDevice, config.monitoring.deviceCheckInterval);
setTimeout(fetchDeviceStats, 1000);
setInterval(fetchDeviceStats, config.monitoring.statsFetchInterval);

// -------------------------------------------------------------------
// Socket.IO event handling
// -------------------------------------------------------------------
io.on('connection', socket => {
  console.log('Client connected');
  socket.emit('status', deviceStatus);

  // Sensors
  socket.on('get-sensors', async (sensors = []) => {
    try {
      const list = sensors.length > 0 ? sensors.join(',') : '-a';
      const result = await executeSSHCommand(`termux-sensor -s ${list} -n 1`);
      const data = JSON.parse(result);
      socket.emit('sensors-data', data);
    } catch (e) {
      console.error('Error getting sensors:', e);
    }
  });

  // Photo capture
  socket.on('take-photo', async () => {
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `photo_${ts}.jpg`;
      const devicePath = `/sdcard/DCIM/${filename}`;
      await executeSSHCommand(`termux-camera-photo -c 0 ${devicePath}`);
      const localPath = path.join(__dirname, 'public', 'photos', filename);
      // Ensure directory exists
      const photosDir = path.join(__dirname, 'public', 'photos');
      if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
      exec(`adb pull ${devicePath} ${localPath}`, (err, out, errStd) => {
        if (err) {
          console.error('Error pulling photo:', err);
          return;
        }
        socket.emit('photo-taken', `/photos/${filename}`);
      });
    } catch (e) {
      console.error('Error taking photo:', e);
    }
  });

  // Clipboard
  socket.on('get-clipboard', async () => {
    try {
      const txt = await executeSSHCommand('termux-clipboard-get');
      socket.emit('clipboard-content', txt);
    } catch (e) {
      console.error('Error getting clipboard:', e);
    }
  });

  socket.on('set-clipboard', async text => {
    try {
      const safe = text.replace(/'/g, "'\\\\''");
      await executeSSHCommand(`termux-clipboard-set '${safe}'`);
    } catch (e) {
      console.error('Error setting clipboard:', e);
    }
  });

  // Media controls
  socket.on('media-control', async action => {
    try {
      await executeSSHCommand(`termux-media-player ${action}`);
    } catch (e) {
      console.error('Error controlling media:', e);
    }
  });

  // Torch
  socket.on('torch-control', async state => {
    try {
      await executeSSHCommand(`termux-torch ${state}`);
    } catch (e) {
      console.error('Error controlling torch:', e);
    }
  });

  // Generic command execution (for terminal panel)
  socket.on('command', async cmd => {
    try {
      const result = await executeSSHCommand(cmd);
      socket.emit('command-output', result.trim());
    } catch (e) {
      socket.emit('command-error', e.message);
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});

// -------------------------------------------------------------------
// Start server
// -------------------------------------------------------------------
server.listen(config.server.port, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 ANDROID 16 DASHBOARD SERVER                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`   🌐 Server running on: http://localhost:${config.server.port}`);
  console.log(`   📁 Public directory: ${config.server.publicDir}`);
  console.log(`   🔧 Environment: ${config.server.env}`);
  console.log('\n   Configuration:');
  console.log(`   • ADB Path: ${config.adb.path}`);
  console.log(`   • SSH Host: ${config.ssh.host}:${config.ssh.port}`);
  console.log(`   • SSH User: ${config.ssh.username}`);
  console.log(`   • SSH Key: ${config.ssh.privateKeyPath ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   • Device check interval: ${config.monitoring.deviceCheckInterval} ms`);
  console.log(`   • Stats update interval: ${config.monitoring.statsFetchInterval} ms`);
  console.log('\n   💡 Tip: Connect your Android device via ADB and forward SSH:');
  console.log('      adb forward tcp:8022 tcp:8022\n');
});
