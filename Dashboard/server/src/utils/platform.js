/**
 * 🌍 Cross-Platform Utility Functions
 * Helpers for Windows/Linux compatibility
 */

const os = require('os');
const path = require('path');
const fs = require('fs');

// ==================
// Platform Detection
// ==================

const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';
const isMac = os.platform() === 'darwin';

/**
 * Get current platform name
 * @returns {string} 'windows', 'linux', or 'mac'
 */
function getPlatform() {
    if (isWindows) return 'windows';
    if (isLinux) return 'linux';
    if (isMac) return 'mac';
    return 'unknown';
}

// ==================
// Path Resolution
// ==================

/**
 * Resolve SSH key path based on OS
 * @returns {string} Absolute path to SSH key
 * @throws {Error} If key not found or not configured
 */
function resolveSSHKey() {
    let keyPath;
    
    if (process.env.AUTO_SELECT_KEY === 'true') {
        keyPath = isWindows 
            ? process.env.SSH_KEY_PATH_WINDOWS 
            : process.env.SSH_KEY_PATH_LINUX;
    } else {
        // Manual path from env
        keyPath = process.env.SSH_KEY_PATH || process.env.SSH_KEY_PATH_WINDOWS || process.env.SSH_KEY_PATH_LINUX;
    }
    
    if (!keyPath) {
        throw new Error('SSH_KEY_PATH not configured in .env');
    }
    
    const resolvedPath = path.resolve(keyPath);
    
    // Validate file exists
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`SSH key not found at: ${resolvedPath}`);
    }
    
    return resolvedPath;
}

/**
 * Resolve ADB executable path
 * @returns {string} Path to ADB or 'adb' if in PATH
 */
function resolveADBPath() {
    const envPath = isWindows 
        ? process.env.ADB_PATH_WINDOWS 
        : process.env.ADB_PATH_LINUX;
    
    if (envPath && fs.existsSync(envPath)) {
        return envPath;
    }
    
    // Fallback to PATH
    return 'adb';
}

/**
 * Normalize path for current OS
 * @param {string} pathStr - Path to normalize
 * @returns {string} Normalized path
 */
function normalizePath(pathStr) {
    return path.normalize(pathStr);
}

// ==================
// Configuration
// ==================

/**
 * Get SSH configuration object
 * @returns {Object} SSH config with host, port, user, key
 */
function getSSHConfig() {
    return {
        host: process.env.SSH_HOST || '127.0.0.1',
        port: parseInt(process.env.SSH_PORT || '8022'),
        username: process.env.SSH_USER || 'u0_a575',
        privateKey: fs.readFileSync(resolveSSHKey())
    };
}

/**
 * Get server configuration
 * @returns {Object} Server config
 */
function getServerConfig() {
    return {
        port: parseInt(process.env.SERVER_PORT || '3001'),
        nodeEnv: process.env.NODE_ENV || 'development',
        debugMode: process.env.DEBUG_MODE === 'true'
    };
}

/**
 * Get device configuration
 * @returns {Object} Device config
 */
function getDeviceConfig() {
    return {
        ip: process.env.DEVICE_IP || null,
        id: process.env.DEVICE_ID || null,
        autoDetectIp: process.env.AUTO_DETECT_IP === 'true'
    };
}

/**
 * Get feature flags
 * @returns {Object} Feature flags
 */
function getFeatureFlags() {
    return {
        enableSSH: process.env.ENABLE_SSH !== 'false',
        enableADB: process.env.ENABLE_ADB !== 'false',
        enableTermuxAPI: process.env.ENABLE_TERMUX_API !== 'false',
        debugMode: process.env.DEBUG_MODE === 'true'
    };
}

/**
 * Get polling intervals
 * @returns {Object} Intervals in milliseconds
 */
function getIntervals() {
    return {
        deviceCheck: parseInt(process.env.DEVICE_CHECK_INTERVAL || '5000'),
        statsUpdate: parseInt(process.env.STATS_UPDATE_INTERVAL || '10000')
    };
}

// ==================
// Validation
// ==================

/**
 * Validate environment configuration
 * @throws {Error} If required config is missing
 */
function validateConfig() {
    const errors = [];
    
    // Check SSH config if enabled
    if (process.env.ENABLE_SSH !== 'false') {
        try {
            resolveSSHKey();
        } catch (err) {
            errors.push(`SSH: ${err.message}`);
        }
        
        if (!process.env.SSH_USER) {
            errors.push('SSH: SSH_USER not configured');
        }
    }
    
    // Check ADB if enabled
    if (process.env.ENABLE_ADB !== 'false') {
        const adbPath = resolveADBPath();
        if (adbPath !== 'adb' && !fs.existsSync(adbPath)) {
            errors.push(`ADB: Executable not found at ${adbPath}`);
        }
    }
    
    if (errors.length > 0) {
        throw new Error(`Configuration errors:\n${errors.join('\n')}`);
    }
}

// ==================
// Logging
// ==================

/**
 * Log platform info
 */
function logPlatformInfo() {
    console.log('🌍 Platform Information:');
    console.log(`   OS: ${getPlatform()} (${os.platform()})`);
    console.log(`   Arch: ${os.arch()}`);
    console.log(`   Node: ${process.version}`);
    console.log(`   Home: ${os.homedir()}`);
}

/**
 * Log configuration
 */
function logConfig() {
    const sshConfig = getSSHConfig();
    const serverConfig = getServerConfig();
    const deviceConfig = getDeviceConfig();
    const features = getFeatureFlags();
    
    console.log('⚙️  Configuration:');
    console.log(`   Server Port: ${serverConfig.port}`);
    console.log(`   SSH: ${features.enableSSH ? '✅' : '❌'} ${sshConfig.username}@${sshConfig.host}:${sshConfig.port}`);
    console.log(`   ADB: ${features.enableADB ? '✅' : '❌'} ${resolveADBPath()}`);
    console.log(`   Termux API: ${features.enableTermuxAPI ? '✅' : '❌'}`);
    console.log(`   Device IP: ${deviceConfig.ip || 'Auto-detect'}`);
    console.log(`   Debug Mode: ${features.debugMode ? '✅' : '❌'}`);
}

// ==================
// Exports
// ==================

module.exports = {
    // Platform detection
    isWindows,
    isLinux,
    isMac,
    getPlatform,
    
    // Path resolution
    resolveSSHKey,
    resolveADBPath,
    normalizePath,
    
    // Configuration getters
    getSSHConfig,
    getServerConfig,
    getDeviceConfig,
    getFeatureFlags,
    getIntervals,
    
    // Validation
    validateConfig,
    
    // Logging
    logPlatformInfo,
    logConfig
};
