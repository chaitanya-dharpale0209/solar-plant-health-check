const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Watch monorepo parent directory for shared fallback data and assets
config.watchFolders = [path.resolve(__dirname, '..')];

module.exports = config;
