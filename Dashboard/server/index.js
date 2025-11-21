const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors(config.cors));

// Ensure public directory exists
const photosDir = path.join(config.server.publicDir, 'photos');
if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
}
app.use('/photos', express.static(photosDir));

const server = http.createServer(app);
const io = new Server(server, {
    cors: config.cors
});

let deviceStatus = {
    connected: false,
    model: 'Unknown',
    battery: null,
    cpu: null,
    ram: null
};

// ADB Monitor
function checkDevice() {
    const adb = spawn(config.adb.path, ['devices']);
    let output = '';

    adb.stdout.on('data', (data) => {
        output += data.toString();
    });

    adb.on('close', () => {
        const lines = output.split('\n');
        const deviceLine = lines.find(line => line.includes('device') && !line.includes('List of devices'));

        if (deviceLine) {
            if (!deviceStatus.connected) {
                console.log('📱 Device Connected!');
                deviceStatus.connected = true;
                deviceStatus.model = deviceLine.split('\t')[0]; // Simple ID for now
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

// Fetch Stats via SSH (assuming port 8022 is forwarded)
function fetchDeviceStats() {
    if (!deviceStatus.connected) return;

    // Check if SSH is configured
    if (!config.ssh.privateKeyPath) {
        console.warn('⚠️  SSH not configured, skipping stats fetch');
        return;
    }

    const conn = new Client();
    conn.on('ready', () => {
        // Get Device Model
        conn.exec('getprop ro.product.model', (err, stream) => {
            if (!err) {
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    deviceStatus.model = buffer.trim() || 'Unknown';
                    io.emit('status', deviceStatus);
                });
            }
        });

        // Battery from sysfs (native Android)
        conn.exec('cat /sys/class/power_supply/battery/capacity', (err, stream) => {
            if (!err) {
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    const level = parseInt(buffer.trim());
                    if (!isNaN(level)) {
                        deviceStatus.battery = level;
                        io.emit('status', deviceStatus);
                    }
                });
            }
        });

        // Battery Status
        conn.exec('cat /sys/class/power_supply/battery/status', (err, stream) => {
            if (!err) {
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    deviceStatus.batteryStatus = buffer.trim();
                    io.emit('status', deviceStatus);
                });
            }
        });

        // RAM (free -m)
        conn.exec('free -m', (err, stream) => {
            if (!err) {
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    // Parse free -m output
                    //              total        used        free
                    // Mem:          7450        3778         178
                    const lines = buffer.split('\n');
                    if (lines.length > 1) {
                        const parts = lines[1].trim().split(/\s+/);
                        if (parts.length >= 3) {
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

        // CPU Temperature (if available)
        conn.exec('cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo "N/A"', (err, stream) => {
            if (!err) {
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    const temp = parseInt(buffer.trim());
                    if (!isNaN(temp)) {
                        deviceStatus.cpuTemp = Math.round(temp / 1000); // Convert from millidegrees
                    }
                    io.emit('status', deviceStatus);
                });
            }
        });

        conn.end();
    }).on('error', (err) => {
        console.error('❌ SSH Connection failed:', err.message);
        console.error('   Make sure SSH is configured in .env and port is forwarded');
    }).connect({
        host: config.ssh.host,
        port: config.ssh.port,
        username: config.ssh.username,
        privateKey: fs.readFileSync(config.ssh.privateKeyPath)
    });
}

// Helper function to execute SSH commands
function executeSSHCommand(command) {
    return new Promise((resolve, reject) => {
        // Check if SSH is configured
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
                let buffer = '';
                stream.on('data', (data) => buffer += data);
                stream.on('close', () => {
                    conn.end();
                    resolve(buffer);
                });
                stream.stderr.on('data', (data) => {
                    console.error('SSH stderr:', data.toString());
                });
            });
        }).on('error', (err) => {
            reject(err);
        }).connect({
            host: config.ssh.host,
            port: config.ssh.port,
            username: config.ssh.username,
            privateKey: fs.readFileSync(config.ssh.privateKeyPath)
        });
    });
}

// Check device immediately on startup
checkDevice();
// Poll for device every configured interval
setInterval(checkDevice, config.monitoring.deviceCheckInterval);

// Fetch stats immediately on startup if device is already connected
setTimeout(fetchDeviceStats, 1000);
// Poll stats every configured interval if connected
setInterval(fetchDeviceStats, config.monitoring.statsFetchInterval);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('status', deviceStatus);

    // --- Termux:API Commands ---

    socket.on('get-sensors', async (sensors = []) => {
        try {
            const sensorList = sensors.length > 0 ? sensors.join(',') : '-a';
            const result = await executeSSHCommand(`termux-sensor -s ${sensorList} -n 1`);
            try {
                const data = JSON.parse(result);
                socket.emit('sensors-data', data);
            } catch (e) {
                console.error('Error parsing sensor data:', e);
            }
        } catch (error) {
            console.error('Error getting sensors:', error);
        }
    });

    socket.on('take-photo', async () => {
        try {
            // Take photo to a temporary path on device
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `photo_${timestamp}.jpg`;
            const devicePath = `/sdcard/DCIM/${filename}`;
            await executeSSHCommand(`termux-camera-photo -c 0 ${devicePath}`);

            // Pull the photo to local server public folder (assuming we have one, or just send base64)
            // For simplicity, let's try to read it via cat and base64 (might be slow for large images)
            // Better: adb pull
            const localPath = path.join(__dirname, 'public', 'photos', filename);
            // Ensure directory exists
            if (!fs.existsSync(path.join(__dirname, 'public', 'photos'))) {
                fs.mkdirSync(path.join(__dirname, 'public', 'photos'), { recursive: true });
            }

            exec(`adb pull ${devicePath} ${localPath}`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error pulling photo:', err);
                    return;
                }
                // Send URL to client
                socket.emit('photo-taken', `/photos/${filename}`);
            });

        } catch (error) {
            console.error('Error taking photo:', error);
        }
    });

    socket.on('get-clipboard', async () => {
        try {
            const result = await executeSSHCommand('termux-clipboard-get');
            socket.emit('clipboard-content', result);
        } catch (error) {
            console.error('Error getting clipboard:', error);
        }
    });

    socket.on('set-clipboard', async (text) => {
        try {
            // Escape single quotes for shell
            const safeText = text.replace(/'/g, "'\\''");
            await executeSSHCommand(`termux-clipboard-set '${safeText}'`);
        } catch (error) {
            console.error('Error setting clipboard:', error);
        }
    });

    socket.on('media-control', async (action) => {
        // action: play, pause, next, prev
        try {
            await executeSSHCommand(`termux-media-player ${action}`);
        } catch (error) {
            console.error('Error controlling media:', error);
        }
    });

    socket.on('torch-control', async (state) => {
        // state: on, off
        try {
            await executeSSHCommand(`termux-torch ${state}`);
        } catch (error) {
            console.error('Error controlling torch:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('command', (cmd) => {
        // Execute command on device via SSH
        // TODO: Implement secure command execution
        console.log('Command received:', cmd);
    });
});

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
    console.log(`   • Device check: every ${config.monitoring.deviceCheckInterval}ms`);
    console.log(`   • Stats update: every ${config.monitoring.statsFetchInterval}ms`);
    console.log('\n   💡 Tip: Connect your Android device via ADB and forward SSH:');
    console.log('      adb forward tcp:8022 tcp:8022\n');
});
