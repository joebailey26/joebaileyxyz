import js from '@eslint/js'
import globals from 'globals'
import galexia from 'eslint-config-galexia'

// Global ignore blocks (only `name` and `ignores`) must stay global, or the CMS would be skipped entirely.
const isGlobalIgnore = (config) => Object.keys(config).every((key) => ['name', 'ignores'].includes(key))
const keepAsIs = (config) => config.name?.startsWith('joebailey/') || isGlobalIgnore(config)

export default galexia
  .prepend({
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
      'cms/migration/'
    ]
  })
  // The CMS package keeps its own plain-JavaScript style (cms/.eslintrc.json), so only the block below lints it.
  .append({
    name: 'joebailey/cms',
    files: ['cms/**/*.js'],
    rules: js.configs.recommended.rules,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    }
  })
  .onResolved((configs) => configs.map((config) => (keepAsIs(config) ? config : { ...config, ignores: [...(config.ignores || []), 'cms/**'] })))
