# Hydrilla AI monorepo

Four independent apps in `apps/` (frontend, backend, admin, docs), each with
its own package.json, in a pnpm workspace with one root pnpm-lock.yaml.
Use pnpm, never npm or yarn (`pnpm --filter <package-name> add <dep>` to add a dependency).

`AGENTS.md` is a symlink to this file. Claude and Cursor read the same instructions.
Add or change a rule in either file; it is the same text. Do not replace the symlink with a second copy.

## Commands (run from repo root)
- `pnpm install`
- `pnpm dev:frontend` (3000) · `dev:backend` (4000) · `dev:admin` (3001) · `dev:docs` (3002)

## Rules for all apps
- **No browser actions.** Do not open, drive, inspect, or screenshot the app with
  browser tools. Verify UI another way (read the component, typecheck, tests)
  and say what was not checked in a browser.
- Never read out, print, or commit `.env*`, `gcp-key.json`, or `uploads/`.

## Git workflow
- **Never commit or push to `main`.** `main` is protected and only changes
  through merged pull requests.
- For any change, create a branch from the latest `main` first
  (`git checkout main && git pull && git checkout -b <type>/<short-name>`,
  e.g. `fix/credits-balance`, `chore/vercel-installs`), commit there, push
  that branch, and open a PR into `main`.
- If you are already on `main` with uncommitted changes, move them to a new
  branch before committing.
