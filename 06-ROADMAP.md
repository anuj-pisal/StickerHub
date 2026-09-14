# Build Roadmap

## Phase 0 — Project Setup
- [ ] `create-next-app` with TypeScript + Tailwind + App Router
- [ ] Set up `GEMINI_API_KEY` env var, verify a basic Gemini API call works
- [ ] Install core deps: `react-konva`, `sharp`, `idb`,
      `@imgly/background-removal`

## Phase 1 — AI Editing Core
- [ ] Build `Uploader` component (single + multi-image modes)
- [ ] Build `/api/ai/edit` route + wire up single-image prompt editing
- [ ] Build `/api/ai/combine` route + wire up multi-image compositing
- [ ] Basic result preview with "revert to original" and re-prompt

## Phase 2 — Editor
- [ ] `EditorCanvas` (Konva) loading AI result as base layer
- [ ] Text layer tool: font, size, color, outline, drag/rotate
- [ ] Crop/resize with 512×512 guide overlay
- [ ] Background removal button (client-side)
- [ ] Undo/redo, layer panel

## Phase 3 — Export & Compliance
- [ ] `/api/convert` route: PNG → static `.webp`, size/dimension
      validation, auto-compress retry
- [ ] Export panel: live size estimate, pass/fail badge, download button

## Phase 4 — Share to WhatsApp
- [ ] Web Share API integration (`navigator.share` with files)
- [ ] Fallback manual-share instructions for unsupported browsers
- [ ] Test on actual phone (Chrome/Android and/or Safari/iOS — real
      share-target behavior differs from desktop)

## Phase 5 — Local Persistence
- [ ] IndexedDB draft storage (`lib/storage.ts`)
- [ ] "My Stickers" gallery page: browse/re-open/re-export past stickers

## Phase 6 — Animated Stickers (stretch)
- [ ] Multi-frame editor mode (create/edit a sequence of frames)
- [ ] Animated `.webp` encoding + validation against 500 KB / duration
      limits
- [ ] Animated preview before export

## Future / Not in v1
- Native Android sticker-tray integration (`ContentProvider` app)
- iOS sticker pack app extension
- Multi-user accounts / cloud sync
