import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow usage of `any` to avoid large sweeping code changes that may break runtime behavior
      '@typescript-eslint/no-explicit-any': 'off',
      // Some files export helpers/constants alongside components; disable fast-refresh restriction
      'react-refresh/only-export-components': 'off',
      // Keep exhaustive-deps as a warning so developers are informed but builds don't fail
      'react-hooks/exhaustive-deps': 'warn',
      // Prefer warning for unused vars; allow args starting with _ to be intentionally unused
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    },
  },
])
