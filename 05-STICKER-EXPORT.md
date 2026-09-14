# Sticker Export & WhatsApp Compliance

## WhatsApp Sticker Spec (target for every export)
| Property | Static | Animated |
|---|---|---|
| Format | WebP | Animated WebP |
| Dimensions | 512×512 px | 512×512 px |
| Max file size | 100 KB | 500 KB |
| Background | Transparent | Transparent |
| Duration | — | ~2–10 sec, up to ~30 frames typical |

## Conversion Pipeline (`app/api/convert/route.ts`)
1. Receive final PNG (or ordered PNG frames for animated) from the
   client-side editor export.
2. Resize/pad to exactly 512×512 (preserve aspect ratio, pad with
   transparency rather than stretching).
3. Encode:
   - Static: `sharp(input).webp({ quality })` — start at quality 80,
     step down if over 100 KB.
   - Animated: combine frames into one animated WebP (via `sharp`'s
     animated output or a shelled-out `img2webp` call), with configurable
     frame delay.
4. **Validate** output against the spec table above.
5. Return either the compliant file, or a structured error describing
   which constraint failed (size/dimensions) plus an auto-retry at lower
   quality before giving up and asking the user to simplify the design.

## Client-Side Feedback
- Show live estimated file size in the editor as the user works (rough
  estimate is fine — exact number comes from the actual conversion
  step).
- On export, show a clear pass/fail badge: "✅ Ready for WhatsApp" or
  "⚠️ 134 KB — over the 100 KB limit, try simplifying or let us
  auto-compress."

## Sharing Flow
1. User taps "Share to WhatsApp."
2. Check `navigator.canShare({ files: [stickerFile] })`.
   - **Supported:** call `navigator.share({ files: [stickerFile] })` —
     opens the OS share sheet with WhatsApp as a target; user picks the
     chat.
   - **Unsupported:** fall back to a direct download + short instructions
     ("Open WhatsApp → chat → attach → choose this file from Downloads").
3. Note: this sends the sticker as a **one-off image/sticker message** in
   a chosen chat — it does not add it to WhatsApp's permanent sticker
   tray. Permanent tray integration requires a native app (see Project
   Overview's Non-Goals) and can be a future phase if desired.
