import js from '@eslint/js'
import globals from 'globals'
import galexia from 'eslint-config-galexia'

// Global ignore blocks (only `name` and `ignores`) must stay global, or the CMS would be skipped entirely.
const isGlobalIgnore = (config) => Object.keys(config).every((key) => ['name', 'ignores'].includes(key))

export default [
  {
    name: 'joebailey/ignores',
    ignores: [
      '.nuxt/',
      '.output/',
      'dist/',
      'cms/runtime/',
      'cms/runtime-source/',
      'cms/dist/',
      'cms/.cache/',
      'cms/.wrangler/',
      'cms/migration/',
      // As before the flat config, the worker and CMS modules (.mjs/.cjs) keep their own style.
      '**/*.mjs',
      '**/*.cjs'
    ]
  },
  // The CMS package keeps its own plain-JavaScript style (cms/.eslintrc.json), so only the last block lints it.
  ...galexia.map((config) => (isGlobalIgnore(config) ? config : { ...config, ignores: [...(config.ignores || []), 'cms/**'] })),
  {
    name: 'joebailey/nuxt-globals',
    files: ['app/**/*.js'],
    languageOptions: {
      // Nuxt's fetch helper, which calls server routes directly while prerendering
      globals: { $fetch: 'readonly' }
    }
  },
  {
    name: 'joebailey/cms',
    files: ['cms/**/*.js'],
    rules: {
      ...js.configs.recommended.rules,
      // New in ESLint 10's recommended set; the CMS code predates it.
      'preserve-caught-error': 'off'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    }
  }
]
