# Sticker Studio — Project Overview

## Vision
A personal, single-user web application that lets you generate WhatsApp stickers
using AI image editing/compositing, refine them in a lightweight editor
(text, fonts, colors, stamps), and export/share them straight to WhatsApp as
valid `.webp` sticker files — no login, no backend user accounts.

## Core Use Cases
1. **Prompt-edit a single image** — upload a photo, describe an edit
   ("make the nose red", "add sunglasses"), get back an AI-edited image to
   use as a sticker base.
2. **Combine multiple images via prompt** — upload 2+ images, describe how
   to merge them ("put the cat from image 2 on this person's shoulder"),
   get a single composited result.
3. **Manual sticker editing** — add text layers (custom fonts, colors,
   outlines), stickers/stamps, crop/resize, background removal, on a
   canvas editor.
4. **Export & ship to WhatsApp** — convert the final design to a
   WhatsApp-compliant `.webp` (static or animated) and send it to
   WhatsApp via the browser's native share sheet.

## Explicit Non-Goals (v1)
- No multi-user accounts, auth, or cloud sync — this is a personal tool.
- No permanent "Add to WhatsApp sticker tray" integration (that requires a
  native Android `ContentProvider` app or iOS sticker pack app extension —
  out of scope since we're going web-first). Sharing is one sticker at a
  time via the OS share sheet.
- No public app store distribution in v1.
- No animated AI generation (AI models used here output static images;
  animated stickers, if built, come from combining multiple static frames
  manually in the editor, not from AI video generation).

## Success Criteria
- Can go from "upload photo" → "prompt edit" → "add text" → "download
  valid .webp" → "share into a WhatsApp chat" in under 2 minutes.
- Generated `.webp` files pass WhatsApp's sticker constraints (512×512,
  transparent background, size limits) every time, without manual
  fixing.
