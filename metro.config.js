const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Kenney ships the starter-kit audio as .ogg, which isn't in Metro's default asset list.
config.resolver.assetExts.push('ogg');

module.exports = config;
