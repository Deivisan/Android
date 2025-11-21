const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Helper to resolve paths based on OS
const resolvePath = (filePath) => {
    if (!filePath) return null;
    // Handle both Windows and Unix paths
    return path.resolve(filePath.replace(/\\/g, path.sep));
};

// Validate SSH key path
const getSSHKeyPath = () => {
    const keyPath = process.env.SSH_KEY_PATH;

    if (!keyPath) {
        console.warn('⚠️  SSH_KEY_PATH not set in .env');
        return null;
    }

    const resolvedPath = resolvePath(keyPath);

    if (!fs.existsSync(resolvedPath)) {
        console.error(`❌ SSH key not found at: ${resolvedPath}`);
        return null;
    }

    return resolvedPath;
};

const config = {
    server: {
        port: parseInt(process.env.PORT) || 3001,
        env: process.env.NODE_ENV || 'development',
        publicDir: resolvePath(process.env.PUBLIC_DIR || './public')
    },

    ssh: {
        host: process.env.SSH_HOST || '127.0.0.1',
        port: parseInt(process.env.SSH_PORT) || 8022,
        username: process.env.SSH_USER || 'u0_a575',
        privateKeyPath: getSSHKeyPath()
    },

    adb: {
        path: process.env.ADB_PATH || 'adb'
    },

    monitoring: {
        deviceCheckInterval: parseInt(process.env.DEVICE_CHECK_INTERVAL) || 5000,
        statsFetchInterval: parseInt(process.env.STATS_FETCH_INTERVAL) || 10000
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
};

// Validate configuration
const validateConfig = () => {
    const errors = [];

    if (!config.ssh.privateKeyPath) {
        errors.push('SSH private key path is not configured or file not found');
    }

    if (errors.length > 0) {
        console.warn('\n⚠️  Configuration Warnings:');
        errors.forEach(error => console.warn(`   - ${error}`));
        console.warn('   Dashboard will run with limited functionality\n');
    }
};

validateConfig();

module.exports = config;
