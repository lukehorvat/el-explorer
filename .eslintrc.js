/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-confusing-void-expression': [
      'warn',
      { ignoreArrowShorthand: true },
    ],
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true },
    ],
    '@typescript-eslint/consistent-type-definitions': 'off',
    'react/no-unknown-property': 'off', // Doesn't seem to work with react-three-fiber.
  },
};
