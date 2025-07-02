module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // TypeScript-specific overrides
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Import rules
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    
    // General rules
    'no-console': 'warn',
    'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
    'max-len': ['error', { code: 120 }],
    'object-curly-newline': 'off',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'function-paren-newline': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-underscore-dangle': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'build/',
    '*.config.js',
    '*.config.ts',
  ],
};