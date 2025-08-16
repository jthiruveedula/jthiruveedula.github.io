module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
  ],
  plugins: ['html'], // To lint <script> tags in HTML files
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Add any specific ESLint rules here
    // Example:
    // 'no-unused-vars': 'warn',
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
  },
  settings: {
    // If you have specific HTML settings
  },
};
