module.exports = {
  extends: ['../../.config/eslint.config.js'],
  env: {
    node: true,
    browser: true,
  },
  rules: {
    'react-refresh/only-export-components': 'off',
  },
};