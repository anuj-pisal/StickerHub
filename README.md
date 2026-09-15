# 🎨 Sticker Studio (StickerHub)

A personal, single-user web app for creating **WhatsApp-ready stickers** using AI image editing/compositing plus a lightweight manual editor — then exporting them as valid `.webp` files you can share straight to WhatsApp.

No accounts, no login, no backend database — just upload, edit, export, share.

## ✨ Features

- **AI prompt-based editing** — upload a photo and describe an edit (e.g. "add sunglasses") to get an AI-edited image back.
- **AI multi-image compositing** — upload two or more images and describe how to merge them into a single composited result.
- **Manual sticker editor** — built on Konva.js: add text layers (custom fonts, colors, outlines), crop/resize, and remove backgrounds client-side.
- **WhatsApp-compliant export** — auto-converts your design to `.webp`, resizing/padding to 512×512 with a transparent background and validating against WhatsApp's size limits (auto-compressing if needed).
- **Native share** — sends the finished sticker via the browser's share sheet (`navigator.share`) directly into a WhatsApp chat, with a download fallback where share isn't supported.
- **Local-only storage** — your images and sticker gallery are kept in the browser (IndexedDB); nothing is uploaded to a server for storage.

## 🧱 Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Canvas editor:** Konva.js / react-konva
- **AI:** Google Gemini (`@google/genai`) for image editing/compositing, with Hugging Face Inference as an alternate provider for some AI routes
- **Image processing:** `sharp` (server-side `.webp` conversion), `@imgly/background-removal` (client-side background removal)
- **Cropping:** `react-image-crop`
- **Local persistence:** IndexedDB via `idb`

## 📂 Project Structure

```
app/
  api/
    ai/edit/       — AI single-image prompt editing endpoint
    ai/combine/    — AI multi-image compositing endpoint
    convert/       — PNG → WhatsApp-compliant .webp conversion endpoint
  gallery/         — Saved stickers gallery page
  page.tsx         — Main editor page
components/
  Uploader.tsx     — Image upload UI
  PromptBar.tsx    — AI prompt input
  EditorCanvas.tsx — Konva-based sticker canvas
  LayerPanel.tsx   — Text/image layer management
  CropModal.tsx    — Cropping UI
  ExportPanel.tsx  — Export & share controls
lib/
  gemini.ts        — Gemini client setup
  bgRemoval.ts     — Client-side background removal helper
  storage.ts       — IndexedDB persistence helpers
types/
  sticker.ts       — Shared sticker/layer type definitions
```

Planning docs (`00`–`06` numbered markdown files) capture the original project overview, requirements, tech stack, architecture, AI integration design, export spec, and roadmap in more detail.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- API keys for the AI providers you intend to use (see below)

### Install

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_google_gemini_api_key
HF_TOKEN=your_huggingface_inference_token
```

- `GEMINI_API_KEY` powers the Gemini-based AI editing/compositing (`lib/gemini.ts`).
- `HF_TOKEN` powers the Hugging Face Inference calls used in the `/api/ai/edit` and `/api/ai/combine` routes.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating stickers.

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the codebase
```

## 📏 WhatsApp Sticker Spec

Every export targets WhatsApp's native sticker requirements:

| Property | Static | Animated |
|---|---|---|
| Format | WebP | Animated WebP |
| Dimensions | 512×512 px | 512×512 px |
| Max file size | 100 KB | 500 KB |
| Background | Transparent | Transparent |

The conversion pipeline resizes/pads to exactly 512×512, encodes to WebP, and validates against these constraints, stepping down quality automatically if a static sticker exceeds 100 KB.

## 🗺️ Roadmap / Non-Goals

This is a v1 personal tool, so it intentionally skips:
- Multi-user accounts, auth, or cloud sync
- Permanent "Add to WhatsApp sticker tray" integration (requires a native app; sharing here is one sticker at a time via the OS share sheet)
- Public app store distribution
- AI-generated animation (animated stickers, if built, come from combining static frames manually rather than AI video generation)

See `06-ROADMAP.md` for planned future phases.

## 📝 License

No license specified yet — personal project.
