# Hydrilla AI Documentation (`docs.hydrilla.co` / `docs.hydrilla.ai`)

Official developer documentation web application for the Hydrilla AI platform, built with Next.js 15 App Router, React 19, and Tailwind CSS.

## Features

- **Interactive API Reference**: Comprehensive specifications for 3D generation (Text-to-3D, Image-to-3D, Task Polling), 2D generation & editing (OpenAI Flare / Sunburst & Google Gemini Flash / Pro Image), and account quotas.
- **Multi-Language Snippets**: Instant, copyable cURL, Python, and TypeScript code blocks with request payloads and responses.
- **Search & Navigation**: Fast client-side search across endpoints, guides, and SDK examples.
- **OpenAPI 3.1 Spec**: Raw OpenAPI specification available at `/openapi.json`.
- **Zero-Config Vercel Deployment**: Automatically detected as a Next.js project by Vercel.

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server on port 3001
npm run dev

# Open http://localhost:3001
```

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment

1. Import repository `git@github.com:dhanushyangal/hydrilla_doc.git` on [Vercel](https://vercel.com/new).
2. Framework Preset: **Next.js** (auto-detected).
3. Click **Deploy**.
4. In Project Settings &rarr; **Domains**, attach your custom domain (`docs.hydrilla.co` or `docs.hydrilla.ai`).
