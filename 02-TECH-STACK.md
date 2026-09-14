# Recommended Tech Stack

Chosen for: single web app, single user, minimal infra, fast to build,
low ongoing cost.

## Frontend + Backend: Next.js (App Router, TypeScript)
- One codebase for UI and lightweight backend (API routes) — no separate
  server to manage.
- Deploys easily to Vercel (or self-hosted with `next start` / Docker) if
  you ever want it reachable outside your machine.
- Styling: **Tailwind CSS** for fast, consistent UI.

## Canvas Editor: Konva.js (`react-konva`)
- Handles layers, text, drag/resize/rotate, and export-to-image cleanly.
- Alternative: Fabric.js — also fine, slightly different API style. Pick
  Konva for better React ergonomics via `react-konva`.

## AI Image Model: Gemini 2.5 Flash Image
- Recommended as the default because it:
  - Handles single-image instruction edits well (localized changes like
    "make the nose red" without regenerating the whole image).
  - Natively accepts **multiple reference images in one call** for
    compositing — covers both FR2 and FR3 with one integration.
  - Reasonably priced for a personal-use volume of requests.
- Called via the Google AI Studio / Gemini API from a Next.js API route
  (keeps your API key server-side, never exposed to the browser).
- Swappable later: OpenAI `gpt-image-1` or FLUX Kontext both fit the same
  "image(s) + instruction → image" interface if you want to compare
  quality/cost.

## Background Removal: `@imgly/background-removal` (client-side, WASM)
- Runs entirely in the browser — no server round-trip, no extra API
  cost, keeps images off any server for a personal tool.

## WebP Conversion: `sharp` (Node, in a Next.js API route)
- Converts final PNG → static `.webp` with resizing to 512×512 and
  quality/size control.
- For **animated** stickers: use `sharp`'s animated WebP support (or
  `webp` CLI tools like `img2webp` shelled out from the API route) to
  combine multiple frame PNGs into one animated `.webp`.

## Local Storage: IndexedDB via `idb` (small wrapper library)
- Stores sticker drafts/history in the browser — no database, no
  accounts, matches the "just me, no login" requirement.

## Sharing: Web Share API (`navigator.share`)
- `navigator.canShare({ files })` to detect support, falls back to a
  manual "download then attach" flow when unsupported (notably: desktop
  Safari/Firefox support varies — this is why we test on your actual
  phone browser (Chrome/Android or Safari/iOS) since that's the real
  share target).

## Summary Table

| Concern | Choice |
|---|---|
| App framework | Next.js (TypeScript, App Router) |
| Styling | Tailwind CSS |
| Canvas editor | Konva.js (`react-konva`) |
| AI image model | Gemini 2.5 Flash Image |
| Background removal | `@imgly/background-removal` (client-side) |
| Image → WebP | `sharp` (server-side API route) |
| Local persistence | IndexedDB (`idb`) |
| Share to WhatsApp | Web Share API + manual fallback |
| Hosting | Vercel (or local `next dev`/`next start`) |
