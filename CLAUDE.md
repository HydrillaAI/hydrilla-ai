# Hydrilla AI monorepo

Four independent apps in `apps/` (frontend, backend, admin, docs), each with
its own package.json, in a pnpm workspace with one root pnpm-lock.yaml.
Use pnpm, never npm or yarn (`pnpm --filter <package-name> add <dep>` to add a dependency).

## Commands (run from repo root)
- `pnpm install`
- `pnpm dev:frontend` (3000) · `dev:backend` (4000) · `dev:admin` (3001) · `dev:docs` (3002)

## Rules for all apps
- **No browser actions.** Do not open, drive, inspect, or screenshot the app with
  browser tools. Verify UI another way (read the component, typecheck, tests)
  and say what was not checked in a browser.
- Never read out, print, or commit `.env*`, `gcp-key.json`, or `uploads/`.
