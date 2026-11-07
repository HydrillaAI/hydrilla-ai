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
- Before every push of that branch (and before opening or updating its PR),
  sync with the latest `main` and fix problems locally:
  1. Fetch the remote, then pull the latest `main`.
  2. Merge that `main` into the working branch (rebase only when the branch
     history is still local and unpushed).
  3. Check for unresolved conflicts, leftover conflict markers, a merge that
     left files incorrect or half-applied, and a branch that is still behind
     `main`.
  4. Fix the merge until the working tree is clean and the branch contains
     the latest `main`.
  5. Review the branch diff against that `main` (`git diff main...HEAD`, plus
     any uncommitted work that will be pushed). Fix what the review finds:
     - **Standards.** The change follows this repo's documented coding
       standards. In TypeScript and JavaScript, use `const` (no `let`) and
       put every `if` body in braces on its own line. No ticket ids, branch
       names, or PR numbers in source comments. No `.env*`, `gcp-key.json`,
       `uploads/`, keys, or tokens in the diff.
     - **Spec.** The change does what was asked. Missing, partial, or wrong
       behavior is fixed. Unrelated behavior is removed.
     - **Correctness.** No conflict markers, half-applied files, or dead code
       left by the merge. Typecheck, and run the tests that cover the apps
       the diff touches. Fix failures.
  6. Push only after the sync and the code review both pass.
- If the merge or the review cannot be fixed cleanly, stop and report what
  failed. Do not push a branch that is behind `main`, still has conflicts, or
  still fails the review.
