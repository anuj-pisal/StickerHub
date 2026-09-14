# Functional Requirements

## 1. Image Upload
- FR1.1 — User can upload one image (drag-drop or file picker) for
  single-image prompt editing.
- FR1.2 — User can upload 2+ images for multi-image compositing.
- FR1.3 — Accept common formats: PNG, JPEG, WEBP. Reject/convert anything
  else.
- FR1.4 — Show upload previews before submitting to AI.

## 2. AI Prompt Editing (single image)
- FR2.1 — User enters a free-text instruction (e.g. "make the nose red").
- FR2.2 — App sends image + instruction to the AI image model and
  displays the edited result.
- FR2.3 — User can re-prompt on the result (iterative editing) or revert
  to the original.
- FR2.4 — Show loading state; handle API errors gracefully (rate limit,
  content policy rejection, timeout).

## 3. AI Multi-Image Compositing
- FR3.1 — User enters a free-text instruction describing how to combine
  the uploaded images.
- FR3.2 — App sends all reference images + instruction in a single AI
  call and displays the composited result.
- FR3.3 — Same iterative re-prompt / revert behavior as FR2.3.

## 4. Manual Sticker Editor
- FR4.1 — Canvas-based editor loads the AI output (or a raw uploaded
  image) as the base layer.
- FR4.2 — Add text layers: font family, size, color, stroke/outline
  color+width (for sticker-style readable text), position, rotation.
- FR4.3 — Add basic shape/stamp overlays (optional v1.5).
- FR4.4 — Crop and resize canvas, with a guide overlay for the 512×512
  target.
- FR4.5 — Background removal: one-click, runs client-side.
- FR4.6 — Undo/redo and layer reordering.
- FR4.7 — Save/export the current design as PNG before sticker
  conversion.

## 5. Sticker Conversion & Compliance
- FR5.1 — Convert final PNG to `.webp` meeting WhatsApp sticker specs:
  - 512×512 px canvas
  - Transparent background
  - Static: < 100 KB
  - Animated: < 500 KB, ~2–10 sec duration
- FR5.2 — Validate output against these limits before allowing
  download/share; show a clear error + auto-compress option if exceeded.
- FR5.3 — Support building an animated sticker from a sequence of frames
  (manually created/edited frames in the editor).

## 6. Export & Share to WhatsApp
- FR6.1 — Download the `.webp` file directly.
- FR6.2 — Use the Web Share API (`navigator.share` with `files`) to send
  the `.webp` straight into a chosen WhatsApp chat, where supported by
  the browser/OS.
- FR6.3 — Fallback: if Web Share API / file sharing isn't supported,
  show clear manual instructions (download, then attach in WhatsApp).

## 7. Local Persistence (no login)
- FR7.1 — Store sticker history/drafts locally (IndexedDB) so refreshing
  the page doesn't lose work.
- FR7.2 — Simple "My Stickers" gallery view of previously generated
  stickers, stored locally.

## Out of Scope (tracked, not required for v1)
- Native Android/iOS sticker-tray integration.
- Multi-user accounts or cloud storage.
- Server-side AI video/animation generation.
