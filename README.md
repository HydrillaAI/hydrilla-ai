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

### 2. How npm install Works in this Setup

Because we used the **independent multi-app structure**, each app in `apps/` has its own isolated `package.json` and its own `node_modules`.

You **don't** need any special monorepo CLI or complex tooling installed. Plain **Node.js** and **npm** are all that are needed.

#### Option A: Install folder by folder

```bash
cd apps/frontend && npm install
cd ../backend && npm install
cd ../admin && npm install
cd ../docs && npm install
```

#### Option B: Single one-liner from the root folder

From the root `hydrilla` directory, run:

```bash
npm run install:all
```

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
| **Frontend** | `npm run dev:frontend` | [http://localhost:3000](http://localhost:3000) |
| **Backend** | `npm run dev:backend` | [http://localhost:4000](http://localhost:4000) |
| **Admin** | `npm run dev:admin` | [http://localhost:3001](http://localhost:3001) |
| **Docs** | `npm run dev:docs` | [http://localhost:3002](http://localhost:3002) |

> [!TIP]
> **💡 Port Tip:** `apps/docs` defaults to port 3001, the same as `apps/admin`, so `npm run dev:docs` runs it on **3002** so both can run at the same time.

---

## 🛠️ Summary of Common Workflows

```bash
# 1. Start Frontend (Tab 1)
npm run dev:frontend

# 2. Start Backend API (Tab 2)
npm run dev:backend

# 3. Start Admin Dashboard (Tab 3)
npm run dev:admin

# 4. Start Documentation (Tab 4)
npm run dev:docs
```
