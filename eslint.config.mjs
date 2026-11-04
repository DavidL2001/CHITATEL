import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next already registers the jsx-a11y plugin; turn on its strict rule set.
  {
    name: 'a11y-strict',
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/sw.js']),
]);
