module.exports = {
  // Existing configuration
  extends: [
    // Other ESLint configurations
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  env: { node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  rules: {
    // Existing rules
    'prettier/prettier': 'error',
  },
  parserOptions: { project: './tsconfig.json', tsconfigRootDir: './', sourceType: 'module', ecmaVersion: 2018 },
  rules: { '@typescript-eslint/no-explicit-any': 'off' },
};
