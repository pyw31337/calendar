import js from '@eslint/js';
import globals from 'globals';

// This app has no build-time JSX (see src/README.md) -- UI is hand-written
// React.createElement(...) calls, and every src/core & src/ui file does
// `const React = window.React;` locally before using it. There is also no
// module-level dependency-injection graph: files under src/ui share state
// via `window.GATHER_*` globals and a `window.GATHER_UI_DEPS` lookup
// (`__gatherUiDeps()`), by design (see PR history), so unused-var checks
// must not flag the repeated per-file wrapper functions that exist purely
// to read from that shared registry.
// firebase/confetti/KoreanLunarCalendar/qrcode load via classic <script> tags in src/index.html
// and attach straight to window, so src/**/*.js reference them as bare globals (no local const,
// unlike React/ReactDOM which react-globals.js assigns to `window.ReactDOM` and every file
// re-declares locally -- except a long tail of call sites that reference the bare `ReactDOM`
// global directly instead, which is just as valid since react-globals.js puts it on window too).
const browserSrcGlobals = {
  ...globals.browser,
  __gatherUiDeps: 'readonly',
  firebase: 'readonly',
  confetti: 'readonly',
  KoreanLunarCalendar: 'readonly',
  qrcode: 'readonly',
  ReactDOM: 'readonly'
};

export default [
  {
    // Build output, the legacy pre-Vite delivery mirror (assets/ + public/assets/) which
    // src/index.html (the real Vite entry) never references, and public-vite/ (static files
    // copied verbatim into dist/ by copy-static-to-dist.mjs, e.g. vendored third-party SDKs) --
    // see copy-static-to-dist.mjs / check-asset-mirrors.mjs. None of these are source anyone
    // edits directly.
    ignores: ['dist/**', 'node_modules/**', 'assets/**', 'public/**', 'public-vite/**', 'functions/node_modules/**', 'share/**']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'src/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: browserSrcGlobals
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: false }]
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: globals.serviceworker
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['scripts/**/*.mjs', 'vite.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['functions/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
];
