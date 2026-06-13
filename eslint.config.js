import eslintPluginAstro from 'eslint-plugin-astro';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  eslintPluginAstro.configs.recommended,
  {
    files: ['*.astro'],
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unused-define-vars': 'error',
    },
  },
  {
    files: ['*.ts', '*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
);