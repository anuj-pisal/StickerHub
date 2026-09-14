# AI Integration Details

## Model
Gemini 2.5 Flash Image, called via the Gemini API from server-side Next.js
API routes only.

## Setup
- Requires a Gemini API key (Google AI Studio) stored as an environment
  variable (`GEMINI_API_KEY`), never exposed to the client.
- Use the official `@google/genai` SDK (or REST) from `lib/gemini.ts`.

## Endpoint 1: Single-Image Edit — `app/api/ai/edit/route.ts`
- **Input:** one image (base64/blob) + text instruction.
- **Behavior:** send image + instruction in one request; ask the model to
  preserve everything not mentioned in the instruction (identity,
  composition, lighting) and only change what's described.
- **Output:** edited image (base64/blob) returned to the client for
  loading into the editor canvas.
- **Prompt framing tip:** prefix user instructions with a system-style
  guidance string, e.g. "Edit only what is described. Keep the subject,
  pose, and background otherwise identical unless asked to change them."

## Endpoint 2: Multi-Image Composite — `app/api/ai/combine/route.ts`
- **Input:** 2+ images (base64/blob array) + text instruction describing
  how to combine them.
- **Behavior:** pass all images as ordered reference inputs in a single
  Gemini call along with the instruction (e.g. "put the subject from
  image 2 onto the background of image 1").
- **Output:** single composited image.

## Error Handling
- Content policy rejections → surface a clear, non-technical message to
  the user ("That request couldn't be completed — try rephrasing").
- Rate limits/timeouts → retry once with backoff, then show a retry
  button.
- Always validate the response actually contains image data before
  passing it to the client; handle text-only/refusal responses
  gracefully.

## Iterative Editing (FR2.3 / FR3.3)
- Keep the *original* uploaded image(s) in client state alongside the
  *current* result, so "revert to original" is a pure client-side
  operation.
- Each re-prompt sends the **current result** (not the original) as the
  input image, so edits stack.

## Cost/Usage Notes
- Since this is single-user/personal use, no rate limiting or quota
  system is needed server-side beyond what the Gemini API itself
  enforces — but log request counts locally (console/simple counter) if
  you want visibility into usage while testing.
