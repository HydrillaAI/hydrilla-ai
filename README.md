# Hydrilla AI Monorepo

Welcome to the **Hydrilla AI** core monorepo. This repository contains the full source code for the entire Hydrilla platform organized as an independent multi-app architecture inside `apps/`.

---

## 🏛️ What App Does What

Hydrilla is split into four focused applications:

| App | Directory | Primary Role & Purpose | Key Tech Stack |
| :--- | :--- | :--- | :--- |
| **Frontend** | `apps/frontend` | **Main User Web Application & 3D Studio**<br>Marketing website, interactive 3D Studio (`/app/studio`), workspaces (`/workspace/:id`) for Cloud 3D generation (GPU &rarr; GLB) and Water / Code Sculpt (BYOK &rarr; Three.js), credit claim flows (`/claim/[token]`), support/feedback modal, Dodo billing integration, Clerk auth, and user dashboard. | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Three.js, Clerk, PostHog, Recharts |
| **Backend** | `apps/backend` | **Core API Server & Orchestration Engine**<br>Express API server handling Clerk auth verification, Cloud 3D generation jobs and polling sync with the GPU VM runtime, Supabase DB access, credit balance and ledger, Dodo payment checkouts & webhooks, Customer.io emails, S3 asset presigned uploads, and Water / Code Sculpt model pipelines. | Node.js, Express, TypeScript, Supabase (PostgreSQL), Clerk SDK, AWS S3, Customer.io, Dodo Payments, Pino |
| **Admin** | `apps/admin` | **Internal Operations Dashboard (`admin.hydrilla.ai`)**<br>Internal portal for the Hydrilla team. Manage users, grant/deduct credits, generate claim links, resolve support & feedback tickets, monitor GPU VMs / GCP instances (start/stop/reboot), track system usage metrics & API costs, configure platform image provider keys, and edit blog posts with TipTap. | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TipTap, Clerk |
| **Docs** | `apps/docs` | **Developer Documentation Portal (`docs.hydrilla.co`)**<br>Public developer documentation site. Features interactive API references (Text-to-3D, Image-to-3D, 2D generation & editing, account quotas), copyable multi-language code snippets (cURL, Python, TypeScript), and OpenAPI 3.1 specifications. | Next.js 15, React 19, TypeScript, Tailwind CSS, Shiki |

---

## 🚀 Getting Started

Follow these steps to set up your local development environment:

### 1. Clone the Repository

Clone the repository into your desired project directory:

```bash
git clone https://github.com/HydrillaAI/hydrilla-ai.git .
```

---

### 2. Install Dependencies (pnpm workspaces)

The repo is a **pnpm workspace** (`pnpm-workspace.yaml`). Each app in `apps/` keeps its own `package.json`, but there is a single `pnpm-lock.yaml` at the root, and packages shared between apps are stored once.

Enable pnpm once (it ships with Node via Corepack; the version is pinned in the root `package.json`):

```bash
corepack enable
```

Then install everything from the repo root:

```bash
pnpm install
```

To add a dependency to one app, run it from the root with a filter, e.g. `pnpm --filter hydrilla-frontend add <pkg>`, or run `pnpm add <pkg>` inside that app's folder. Don't use `npm install`; it would create a `package-lock.json` (ignored by git) and a separate `node_modules` layout.

---

### 3. Don't Forget Environment Variables (`.env.local`)

Git does not track `.env` or `.env.local` files for security. Before starting the servers locally, copy your local env files from your previous local folders into their corresponding directories:

- `apps/frontend/.env.local`
- `apps/backend/.env` (and `.env.local`)
- `apps/admin/.env.local`
- `apps/docs/.env.local` (if any)

*(Alternatively, if you use Vercel CLI, you can run `cd apps/frontend && vercel env pull .env.local`)*

> [!IMPORTANT]
> ### 🔑 Ask CTO for Env Keys!
> If you are setting up this repository fresh or need the latest secrets (Clerk keys, Supabase credentials, S3 secrets, Dodo Payments, GPU API tokens, Customer.io keys, etc.), **ask the CTO for the environment variables (`.env.local` / `.env`)** to get up and running smoothly.

---

### 4. How to Run Each App (Ports & Commands)

Run each app from the repo root, in separate terminal tabs:

| App | Command (from root) | Local URL |
| :--- | :--- | :--- |
| **Frontend** | `pnpm dev:frontend` | [http://localhost:3000](http://localhost:3000) |
| **Backend** | `pnpm dev:backend` | [http://localhost:4000](http://localhost:4000) |
| **Admin** | `pnpm dev:admin` | [http://localhost:3001](http://localhost:3001) |
| **Docs** | `pnpm dev:docs` | [http://localhost:3002](http://localhost:3002) |

> [!TIP]
> **💡 Port Tip:** `apps/docs` defaults to port 3001, the same as `apps/admin`, so `pnpm dev:docs` runs it on **3002** so both can run at the same time.

---

## 🛠️ Summary of Common Workflows

```bash
# 1. Start Frontend (Tab 1)
pnpm dev:frontend

# 2. Start Backend API (Tab 2)
pnpm dev:backend

# 3. Start Admin Dashboard (Tab 3)
pnpm dev:admin

# 4. Start Documentation (Tab 4)
pnpm dev:docs
```
