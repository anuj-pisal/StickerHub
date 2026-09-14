# Architecture

## High-Level Flow
```
[Upload image(s)] 
      │
      ▼
[AI Prompt Edit/Combine]  ──►  Next.js API route  ──►  Gemini 2.5 Flash Image API
      │                                                      │
      ◄──────────────────────── edited/composited image ────┘
      ▼
[Canvas Editor: text, stamps, crop]  (Konva.js, client-side)
      ▼
[Background Removal]  (client-side, WASM)
      ▼
[Export PNG]  ──►  Next.js API route  ──►  sharp  ──►  validated .webp
      ▼
[Download / Web Share API → WhatsApp]
      ▼
[Save draft to IndexedDB ("My Stickers")]
```

## Folder Structure (proposed)
```
sticker-studio/
├── app/
│   ├── page.tsx                 # main studio UI (upload → edit → export)
│   ├── gallery/page.tsx         # "My Stickers" local history view
│   └── api/
│       ├── ai/edit/route.ts     # single-image prompt edit → Gemini
│       ├── ai/combine/route.ts  # multi-image composite → Gemini
│       └── convert/route.ts     # PNG(s) → .webp via sharp, validates limits
├── components/
│   ├── Uploader.tsx
│   ├── PromptBar.tsx
│   ├── EditorCanvas.tsx         # Konva stage: text layers, crop guide
│   ├── LayerPanel.tsx           # text/font/color controls, layer list
│   └── ExportPanel.tsx          # download / share buttons, size feedback
├── lib/
│   ├── gemini.ts                # Gemini API client wrapper
│   ├── webp.ts                  # sharp conversion + spec validation helpers
│   ├── bgRemoval.ts             # @imgly/background-removal wrapper
│   └── storage.ts               # IndexedDB (idb) helpers for drafts/gallery
└── types/
    └── sticker.ts                # Sticker, Layer, Draft type defs
```

## Key Design Decisions
- **API key stays server-side.** All Gemini calls go through Next.js API
  routes (`app/api/ai/*`); the browser never holds the API key.
- **Editor state lives entirely client-side** until export — no server
  needed to persist in-progress edits (IndexedDB handles that locally).
- **Conversion is server-side** because `sharp`'s native WebP
  encoding (especially animated) is more reliable in Node than
  in-browser WASM equivalents.
- **Validation happens before offering download/share** — the
  `/api/convert` route checks output dimensions and file size against
  WhatsApp's limits and returns a clear pass/fail + suggested fix
  (e.g. "reduce quality" or "trim frames") rather than silently shipping
  a non-compliant file.

## Data Model (draft sketch)
```ts
type Layer =
  | { type: "image"; src: string; x: number; y: number; scale: number }
  | { type: "text"; text: string; font: string; size: number;
      color: string; strokeColor: string; strokeWidth: number;
      x: number; y: number; rotation: number };

type Draft = {
  id: string;
  createdAt: number;
  baseImage: string;       // data URL of AI-generated/uploaded base
  layers: Layer[];
  exportedWebpUrl?: string;
  isAnimated: boolean;
  frames?: string[];       // for animated stickers: ordered frame data URLs
};
```
