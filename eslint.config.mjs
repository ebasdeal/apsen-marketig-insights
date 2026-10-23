import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

const IO_AND_UI_LIBS = [
  'react',
  'react-*',
  'next',
  'next/*',
  'zod',
  'zustand',
  'zustand/*',
  '@tanstack/*',
];

const layer = (type) => ({ element: { type } });
const layers = (...types) => ({ element: { types: { anyOf: types } } });

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'node_modules/**', 'next-env.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/__tests__/**'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain' },
        { type: 'application', pattern: 'src/application' },
        { type: 'infrastructure', pattern: 'src/infrastructure' },
        { type: 'presentation', pattern: 'src/presentation' },
        { type: 'main', pattern: 'src/main' },
        { type: 'app', pattern: 'src/app' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: layer('domain'), allow: { to: layer('domain') } },
            { from: layer('application'), allow: { to: layers('domain', 'application') } },
            {
              from: layer('infrastructure'),
              allow: { to: layers('domain', 'infrastructure') },
            },
            {
              from: layer('presentation'),
              allow: { to: layers('domain', 'application', 'presentation') },
            },
            {
              from: layer('main'),
              allow: {
                to: layers('domain', 'application', 'infrastructure', 'presentation', 'main'),
              },
            },
            { from: layer('app'), allow: { to: layers('main', 'presentation', 'app') } },
            { allow: { to: { module: { origin: 'external' } } } },
            { allow: { to: { module: { origin: 'core' } } } },
          ],
        },
      ],
    },
  },
  {
    files: ['src/domain/**/*.ts', 'src/application/**/*.ts'],
    ignores: ['src/**/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: IO_AND_UI_LIBS,
              message:
                'domain/application devem ser puros: sem UI, IO ou bibliotecas de framework.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/__tests__/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}', 'vitest.setup.ts'],
    languageOptions: { globals: { ...globals.vitest } },
    rules: { 'no-console': 'off' },
  },
  prettierConfig,
]);
