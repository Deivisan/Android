import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import {
  Terminal, Cpu, Wifi, Battery, Zap, Activity, Smartphone,
  Camera, Clipboard, Music, Bell, Flashlight, Play, Pause, SkipForward, SkipBack
} from 'lucide-react';
import './index.css';

const socket = io('http://localhost:3001');

function App() {
  const [sensors, setSensors] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [clipboard, setClipboard] = useState('');
  const [deviceStatus, setDeviceStatus] = useState({
    connected: false,
    model: 'Searching...',
    battery: null,
    ram: { total: 0, used: 0, free: 0 }
  });

  useEffect(() => {
    socket.on('status', (status) => {
      setDeviceStatus(status);
    });

    socket.on('sensors-data', (data) => {
      setSensors(data);
    });

    socket.on('photo-taken', (url) => {
      setPhotoUrl(`http://localhost:3001${url}`);
    });

    socket.on('clipboard-content', (content) => {
      setClipboard(content);
    });

    // Cleanup function for all listeners
    return () => {
      socket.off('status');
      socket.off('sensors-data');
      socket.off('photo-taken');
      socket.off('clipboard-content');
    };
  }, []);

  const getSensors = () => {
    socket.emit('get-sensors');
  };

  const takePhoto = () => {
    socket.emit('take-photo');
  };

  const mediaControl = (action) => {
    socket.emit('media-control', action);
  };

  const toggleTorch = (state) => {
    socket.emit('torch-control', state);
  };

  const getClipboard = () => {
    socket.emit('get-clipboard');
  };

  const setClipboardContent = () => {
    socket.emit('set-clipboard', clipboard);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="glass-panel header-panel neon-border">
        <div>
          <h1 className="dashboard-title">
            ANDROID 16 DASHBOARD
          </h1>
          <p className="dashboard-subtitle">
            <Activity size={16} /> SYSTEM MONITORING ACTIVE
          </p>
        </div>
        <div className={`status-pill ${deviceStatus.connected ? 'online' : 'offline'}`}>
          <Wifi size={20} />
          <span className="status-text">{deviceStatus.connected ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      <main className="dashboard-grid">
        {/* Device Card */}
        <motion.div className="card device-card" variants={cardVariants}>
          <div className="card-header">
            <Smartphone className="card-icon" />
            <h2>Device Info</h2>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="label">Model</span>
              <span className="value">{deviceStatus.model}</span>
            </div>
            <div className="info-row">
              <span className="label">Status</span>
              <span className="value highlight">{deviceStatus.connected ? 'Connected via ADB' : 'Disconnected'}</span>
            </div>
          </div>
        </motion.div>

        {/* Battery Card */}
        <motion.div className="card battery-card" variants={cardVariants}>
          <div className="card-header">
            <Battery className="card-icon" />
            <h2>Power</h2>
          </div>
          <div className="gauge-container">
            <div className="gauge-bg">
              <motion.div
                className="gauge-fill"
                initial={{ width: 0 }}
                animate={{ width: `${deviceStatus.battery || 0}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className="gauge-value">{deviceStatus.battery !== null ? `${deviceStatus.battery}%` : '--'}</span>
          </div>
        </motion.div>

        {/* RAM Card */}
        <motion.div className="card ram-card" variants={cardVariants}>
          <div className="card-header">
            <Cpu className="card-icon" />
            <h2>Memory</h2>
          </div>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{deviceStatus.ram?.total || 0} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Used</span>
              <span className="stat-value">{deviceStatus.ram?.used || 0} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Free</span>
              <span className="stat-value">{deviceStatus.ram?.free || 0} MB</span>
            </div>
          </div>
        </motion.div>

        {/* Advanced Controls Grid */}
        <div className="advanced-grid">

          {/* Sensors Panel */}
          <div className="glass-panel neon-border">
            <h2 className="panel-title text-yellow">
              <Activity size={20} /> Sensors
            </h2>
            <div className="sensor-data">
              {Object.entries(sensors).length > 0 ? (
                <pre>{JSON.stringify(sensors, null, 2)}</pre>
              ) : (
                <div className="no-data">No Sensor Data</div>
              )}
            </div>
            <button onClick={getSensors} className="btn-primary full-width">
              Refresh Sensors
            </button>
          </div>

          {/* Camera & Media Panel */}
          <div className="glass-panel neon-border">
            <h2 className="panel-title text-pink">
              <Camera size={20} /> Media & Camera
            </h2>
            <div className="media-camera-grid">
              <button onClick={takePhoto} className="btn-secondary camera-btn">
                <Camera size={24} className="mb-2" />
                Quick Photo
              </button>
              <div className="media-controls">
                <div className="media-buttons">
                  <button onClick={() => mediaControl('previous')} className="icon-btn"><SkipBack size={16} /></button>
                  <button onClick={() => mediaControl('play')} className="icon-btn"><Play size={16} /></button>
                  <button onClick={() => mediaControl('pause')} className="icon-btn"><Pause size={16} /></button>
                  <button onClick={() => mediaControl('next')} className="icon-btn"><SkipForward size={16} /></button>
                </div>
                <button onClick={() => toggleTorch('on')} className="btn-secondary small-btn">Torch ON</button>
                <button onClick={() => toggleTorch('off')} className="btn-secondary small-btn">Torch OFF</button>
              </div>
            </div>
            {photoUrl && (
              <div className="photo-preview">
                <img src={photoUrl} alt="Camera Capture" />
              </div>
            )}
          </div>

          {/* Clipboard & Actions */}
          <div className="glass-panel neon-border">
            <h2 className="panel-title text-green">
              <Clipboard size={20} /> Clipboard & Actions
            </h2>
            <textarea
              value={clipboard}
              onChange={(e) => setClipboard(e.target.value)}
              className="clipboard-area"
              placeholder="Device Clipboard..."
            />
            <div className="action-buttons">
              <button onClick={getClipboard} className="btn-secondary small-btn flex-1">Get</button>
              <button onClick={setClipboardContent} className="btn-primary small-btn flex-1">Set</button>
            </div>
            <div className="extra-actions">
              <button className="btn-secondary small-btn">Send Notification</button>
              <button className="btn-secondary small-btn">Vibrate</button>
            </div>
          </div>

        </div>

        {/* AI Agents Card */}
        <motion.div className="card agents-card" variants={cardVariants}>
          <div className="card-header">
            <Activity className="card-icon" />
            <h2>AI Agents</h2>
          </div>
          <div className="agents-grid">
            <div className="agent-item active">
              <div className="agent-dot"></div>
              <span>Qwen</span>
            </div>
            <div className="agent-item inactive">
              <div className="agent-dot"></div>
              <span>Gemini</span>
            </div>
            <div className="agent-item inactive">
              <div className="agent-dot"></div>
              <span>Copilot</span>
            </div>
          </div>
        </motion.div>

        {/* Terminal Card */}
        <motion.div className="card terminal-card" variants={cardVariants}>
          <div className="card-header">
            <Terminal className="card-icon" />
            <h2>Quick Actions</h2>
          </div>
          <div className="actions-list">
            <button className="action-btn">Sync Workspace</button>
            <button className="action-btn">Update Packages</button>
            <button className="action-btn">Reboot Device</button>
          </div>
        </motion.div>
        {/* Terminal Section */}
        <section className="terminal-section glass-panel neon-border">
          <h2 className="panel-title text-green"><Terminal size={20} /> Terminal</h2>
          <TerminalPanel socket={socket} />
        </section>
      </main>
    </motion.div>
  );
}

export default App;
