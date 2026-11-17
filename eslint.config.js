// Catatan: eslint-config-airbnb-base@15 hanya mendukung ESLint 7/8
// (peer eslint ^7.32.0 || ^8.2.0), jadi package ini memakai @eslint/js
// recommended + eslint-plugin-import di ESLint 9 — aturan intinya sama:
// no-console di library, ===, prefer-const, no-var, no-unused-vars.
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'error',
      'import/no-duplicates': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'for...in dilarang, pakai Object.keys/map/for...of.',
        },
      ],
    },
  },
  {
    files: ['bin/**/*.js', 'examples/**/*.js'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: { console: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
];
