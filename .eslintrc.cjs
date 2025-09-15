module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // project-specific overrides
    'no-console': 'off',
    // allow explicit .js extensions in imports (Vite projects often use them)
    'import/extensions': ['error', 'ignorePackages', { js: 'always', mjs: 'never', cjs: 'never' }],
    'import/prefer-default-export': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.mjs', '.cjs', '.json']
      }
    }
  }
};
