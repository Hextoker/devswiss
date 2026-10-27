# AGENTS.md

DevSwiss: privacy-first dev utilities. Next.js 16 App Router + React 19 + Tailwind v4 + Zustand. UI copy is **Spanish**.

## Commands

```bash
npm run dev          # dev server on :3000
npm run lint         # eslint (flat config)
npx tsc --noEmit     # typecheck (no script defined)
npm run build        # next build (output: "standalone")
npm run seo:audit    # static SEO/consistency checks — run after tool changes
```

There is **no test suite**. Verify with lint → `tsc --noEmit` → build (+ `seo:audit` for tool/SEO changes). No CI workflows exist.

Docker (`docker-compose up -d --build`) runs the app on :3000 plus Umami analytics on 127.0.0.1:3001; Umami/postgres need `.env` with `POSTGRES_*` and `UMAMI_*` vars. App itself needs no env to build or run locally.

## Adding a tool — registration is centralized

Routing is NOT file-based. `src/app/tools/[id]/page.tsx` is the only route (`dynamicParams = false`, `force-static`): an id missing from its maps 404s. A new tool in `src/tools/<slug>/page.tsx` must also be added to:

1. `src/data/tools.ts` — registry driving static params, home grid, and Command Palette
2. `toolPageLoaders` in `src/app/tools/[id]/page.tsx` — lazy import (required to render)
3. `toolEmojiMap` in the same file — optional emoji favicon
4. `toolPaths` in `src/app/sitemap.ts` — hardcoded list, not auto-derived
5. `llms.txt` (root) and `public/llms.txt` — see gotcha below

The `tool.config.json` files in some tool dirs are **not consumed by any code** — ignore them; `src/data/tools.ts` is the real registry.

`npm run seo:audit` checks that tool pages have metadata, are wrapped in `ToolLayout`, and appear in the sitemap.

## llms.txt gotcha

Two copies exist. The **served** file is `public/llms.txt` (at `/llms.txt`); the root `llms.txt` is more current — `public/llms.txt` still describes CORS/SVG/SQL tools as "roadmap placeholders". When updating tool inventory, update both.

## Architecture rules (docs/CONTEXT.md is the authoritative rulebook)

- **100% client-side processing**: tool logic (RUT, JWT, hashes, files, tokens) must run in the browser; never send user payloads to any server. Persistence is `localStorage` via Zustand stores in `src/store/`.
- Only intentional server code: OG image routes (`/api/og`, `/api/social-image`) and `/api/openai/*` (pedagogical regex generation via `src/services/openai.ts`, requires `OPENAI_API_KEY`). `useAIExplain` is currently a local placeholder, not a real API call.
- Tool pages are `'use client'` components with default export, wrapped in `ToolLayout` (handles auto-focus and Esc-to-home unless the Command Palette is open).
- Deployment target is **EC2 + Docker** (Dockerfile uses the `standalone` output). Ignore `llms.txt`'s CloudFront/S3 claim — outdated.
