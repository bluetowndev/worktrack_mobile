const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ensure resolver exists
config.resolver = config.resolver || {};

// Add resolver configuration to ensure single React instance
config.resolver.alias = {
  ...config.resolver.alias,
  'react': require.resolve('react'),
  'react-native': require.resolve('react-native'),
};

module.exports = withNativeWind(config, { input: "./global.css" });