module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    // 'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/ban-types': 'off'
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-use-before-define': 'off',
    // '@typescript-eslint/explicit-member-accessibility': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // '@typescript-eslint/prefer-interface': 'off',
    // '@typescript-eslint/array-type': 'off'
  }
};
