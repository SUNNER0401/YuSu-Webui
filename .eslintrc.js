module.exports = {
  root: true,
  plugins: ['@typescript-eslint', 'prettier'],
  env: {
    node: true,
    browser: true,
    jquery: true,
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/prettier',
    '@vue/typescript/recommended',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/explict-function-return-type': 'off',
  },
  parser: 'vue-eslint-parser',
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
        '*.ts',
        '*.tsx',
        '*.vue',
        '*.js',
      ],
      rules: {
        'prefer-const': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/ban-ts-comment': ['off'],
      },
      env: {
        jest: true,
      },
    },
  ],
};
