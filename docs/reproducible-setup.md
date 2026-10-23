# Reproducible project setup

The Git repository is the source of truth for the application source, tests,
Firebase rules/configuration, deployment workflows, and checked-in design
assets. A fresh checkout can be prepared without copying this workstation's
dependency or build caches.

## Fresh machine

```bash
git clone https://github.com/pyw31337/calendar.git
cd calendar
npm ci
cd functions
npm ci
cd ..
npm run build
```

Provide runtime configuration and credentials through the machine/CI secret
store. Never commit `.env*`, Firebase Admin/service-account credentials, or
production data exports.

## Intentionally local-only

- `node_modules/` and `functions/node_modules/`: dependency caches; restore
  with `npm ci`.
- `dist/`: generated deploy output; restore with `npm run build`.
- `ops-backups/`: production data exports; keep in encrypted, access-controlled
  backup storage rather than Git.
- `designv2/parity-shots/` live captures: generated QA evidence and may contain
  user data; keep outside the source repository unless sanitized.
- `.env*`, service-account files, and API credentials: provision securely.

When a local artifact is required to reproduce a feature, add the sanitized
source/design input (not a dependency cache, live capture, or secret) to Git
and document its generation or restore command here.
