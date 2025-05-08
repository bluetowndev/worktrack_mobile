module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false, // Optional: Enable safe mode to fail if .env is missing
          allowUndefined: true, // Optional: Allow undefined variables
        },
      ],
    ],
  };
};