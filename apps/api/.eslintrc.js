module.exports = {
  extends: ['../../.config/eslint.config.js'],
  env: {
    node: true,
    browser: false,
  },
  rules: {
    'react-refresh/only-export-components': 'off',
  },
};