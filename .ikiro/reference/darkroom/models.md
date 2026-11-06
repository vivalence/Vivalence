<!-- limit: 40000 chars · research 2026-11-08, one opus agent, 49 fetches · reference, read-only · UNVERIFIED marks the agent's own gaps · quest: .ikiro/quests/m118-darkroom.org -->
# models — image generation and editing APIs, 2026-11-08

What a provider in `commons/hallucinators/<slug>/` would translate. Prices and endpoints carry their URL; a figure without one is UNVERIFIED. arena.ai refused the agent's fetches; its board comes from a mirror.

## 0. what changed since the training cut

- **OpenAI.** Current: `gpt-image-2`, `gpt-image-2.5-{sunburst,flare}` (2026-09-08), `gpt-image-2.6-{sunburst,flare}` (2026-11). Sunburst = precise editing, Flare = fast generation. `gpt-image-1` SHUT DOWN 2026-10-23; `gpt-image-1.5` · `gpt-image-1-mini` still served. https://developers.openai.com/api/docs/pricing · https://developers.openai.com/api/reference/resources/images/methods/edit
- **Google.** Models: `gemini-nano-banana-2.1` (main), `gemini-3.1-flash-image` (Nano Banana 2), `gemini-3.1-flash-lite-image`, `gemini-3-pro-image` (Nano Banana Pro), `gemini-2.5-flash-image` (deprecated). **Imagen "legacy … now shut down"**, no `:predict` documented. The recommended API is **Interactions** (`/v1beta/interactions`); `generateContent` is "legacy". https://aistudio.google.com/docs/image-generation · https://ai.google.dev/gemini-api/docs/migrate-to-interactions
- **BFL.** **FLUX 3 Image** at `api.bfl.ai/v1/flux-3-image`; **FLUX 3 Image Klein** (5.6B, open weights, 2026-10-15). FLUX.2 and Kontext still served. https://bfl.ai/pricing · https://docs.bfl.ml/flux_3/flux3_image_klein.md

## 1. comparison

| provider | model | gen | edit | mask | multi-ref | max refs | sizes | sync | $/image | auth |
|---|---|---|---|---|---|---|---|---|---|---|
| OpenAI | gpt-image-2.6-sunburst · -flare | ✓ | ✓ | ✓ image 1; `markup` | ✓ | 16 | custom ≤3840×2160, ÷16, ≤3:1 | sync + SSE partials | $30/M out tokens; ≈$0.21 max 1024² | `Authorization: Bearer` |
| OpenAI | gpt-image-2.5-sunburst · -flare | ✓ | ✓ | ✓ | ✓ | 16 | same | sync | $30/M out tokens | Bearer |
| OpenAI | gpt-image-2 | ✓ | ✓ | ✓ | ✓ | 16 | same | sync | 1024²: low $0.006 · med $0.053 · high $0.211 | Bearer |
| OpenAI | gpt-image-1.5 | ✓ | ✓ | ✓ | ✓ | 16 | 1024² · 1536×1024 · 1024×1536 | sync | $0.009 · $0.034 · $0.133 | Bearer |
| OpenAI | gpt-image-1-mini | ✓ | ✓ | ✓ | ✓ | 16 | same | sync | $0.005 · $0.011 · $0.036 | Bearer |
| Google | gemini-nano-banana-2.1 | ✓ | ✓ conversational | ✗ prompt only | ✓ | 14 (10 object + 4 character) | 1K · 2K · 4K | sync | $0.0336 · $0.0504 · $0.113 | `x-goog-api-key` |
| Google | gemini-3.1-flash-image | ✓ | ✓ | ✗ | ✓ | 14 | 0.5K–4K | sync | $0.045–$0.151 | x-goog-api-key |
| Google | gemini-3-pro-image | ✓ | ✓ | ✗ | ✓ | 14 (6 + 5 + 3 style) | 1K–4K | sync | $0.134 (1K/2K) · $0.24 (4K) | x-goog-api-key |
| Google | Imagen 4 · 4 Ultra | — | — | — | — | — | — | SHUT DOWN | — | — |
| BFL | FLUX 3 Image | ✓ | ✓ | ✗ (bounding boxes in prompt) | ✓ | 10 | 768sq–4K; w/h 256–6256 | async poll | $0.048 (1K) · $0.10 (2K) · $0.607 (4K); refs free | `x-key` |
| BFL | FLUX 3 Image Klein | ✓ | ✓ | ✗ | ✓ | 10 | ≤4K | async | $0.009 (1K) · $0.036 (4K) | x-key |
| BFL | FLUX.2 pro · max · flex | ✓ | ✓ | ✗ | ✓ | 8 | ≤4MP | async | pro $0.03 + $0.015/MP; max $0.07 + $0.03; flex $0.05/MP | x-key |
| BFL | Kontext pro · max | ✓ | ✓ | ✗ | UNVERIFIED | UNVERIFIED | — | async | $0.04 · $0.08 | x-key |
| BFL | FLUX.1 Fill pro | — | — | ✓ | — | — | — | async | $0.05 | x-key |
| fal | flux-3-image/edit · nano-banana-pro/edit · seedream 4.5 · 5 pro edit · qwen-image-edit-2511 · ideogram 4.5 | ✓ | ✓ | per model | ✓ | per model | per model | queue | FLUX 3 $0.048/MP · NB Pro $0.15 · Seedream 4.5 $0.04 · 5 Pro $0.0675 | `Authorization: Key` |
| Replicate | gpt-image-2.6 · nano-banana-2.1 · flux-3-image · seedream-4.5 · qwen-image-edit-plus · ideogram-4-5-precise-edit · flux-fill-pro | ✓ | ✓ | per model | ✓ | per model | per model | async, `Prefer: wait` ≤60 s | UNVERIFIED | Bearer |
| local | FLUX 3 Klein (mflux) · Qwen-Image-Edit-2511 (mflux) · ComfyUI | ✓ | ✓ | ComfyUI ✓ | ✓ | 10 | — | ComfyUI queue + ws | free | none |

Sources: OpenAI per-image https://developers.openai.com/api/docs/guides/image-generation (calculator; no per-image table for 2.5/2.6, the $0.21 is Artificial Analysis' per-1k https://artificialanalysis.ai/text-to-image/arena/leaderboard-text) · Google https://aistudio.google.com/docs/pricing · BFL https://bfl.ai/pricing + https://docs.bfl.ml/flux_2/flux2_overview · fal https://fal.ai/pricing · Qwen on fal ≈$0.03 (third party) https://pricepertoken.com/image/model/qwen-qwen-image-edit-2511 · Replicate https://replicate.com/collections/image-editing

## 2. request · response shapes

### OpenAI Image API — edits (JSON; multipart also works)

`images[]` = `{image_url}` (URL or data URL) | `{file_id}`, ≤16. `mask` needs an alpha channel, applies to image 1 only, cannot combine with `markup`. `quality` low · medium · high · auto (+ xhigh · max on 2.5). `output_format` png · webp · jpeg · gif · svg. `background` transparent · opaque · auto. `input_fidelity` omitted for gpt-image-2. `stream` + `partial_images` 0–3. Response `data[].b64_json` + `usage`; stream events `image_edit.partial_image` · `image_edit.completed`. https://developers.openai.com/api/reference/resources/images/methods/edit

```js
const response = await fetch("https://api.openai.com/v1/images/edits", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gpt-image-2.5-sunburst",
    prompt: "Put the mug from image 2 on the desk in image 1, match lighting",
    images: [{ image_url: "data:image/png;base64,…" }, { file_id: "file_abc" }],
    mask: { image_url: "data:image/png;base64,…" },
    size: "1536x1024", quality: "high", output_format: "webp", n: 1,
  }),
});
const { data: [{ b64_json }], usage } = await response.json();
```

Generation: `POST /v1/images/generations`, same body minus `images` · `mask`.

### OpenAI Responses API — `image_generation` tool (multi-turn)

Tool fields `model · size · quality · format · compression · background · partial_images (1–3) · action (auto | generate | edit)`; continue with `previous_response_id` or an earlier `image_generation_call` id in `input`. Output item `{type: "image_generation_call", id, status, revised_prompt, result: <b64>}`; stream event `response.image_generation_call.partial_image` with `partial_image_b64`. Organization Verification required for GPT Image models. https://developers.openai.com/api/docs/guides/tools-image-generation

```js
body: JSON.stringify({
  model: "gpt-5.5",
  previous_response_id: prevId,
  input: "Now make the background dusk",
  tools: [{ type: "image_generation", model: "gpt-image-2.5-sunburst", action: "edit", quality: "high", partial_images: 2 }],
  stream: true,
})
```

### Google Interactions API

Headers `x-goog-api-key` + `Api-Revision: 2026-05-20`. Images as `{type: "image", mime_type, data}`. Response `steps[]`; the step `type === "model_output"` holds `content[]` with `{type: "image", data}`. **No mask**: inpainting is conversational. Every output carries SynthID. https://aistudio.google.com/docs/image-generation

```js
const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
  method: "POST",
  headers: { "x-goog-api-key": KEY, "Api-Revision": "2026-05-20", "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "gemini-nano-banana-2.1",
    previous_interaction_id: prev,
    input: [
      { type: "image", mime_type: "image/png", data: b64 },
      { type: "text", text: "Add a knitted wizard hat to the cat" },
    ],
    response_format: { type: "image", mime_type: "image/png", aspect_ratio: "16:9", image_size: "2K" },
  }),
});
const image = (await response.json()).steps.find((step) => step.type === "model_output").content.find((part) => part.type === "image").data;
```

`generateContent` still answers but is labeled legacy; whether `generationConfig.imageConfig` works on 2.1 and 3.x image models is UNVERIFIED.

### BFL FLUX 3 Image — async

Submit `POST https://api.bfl.ai/v1/flux-3-image`: `prompt` · `images` (1–10, URL or base64) · `aspect_ratio` · `resolution` (`768sq` · `1k` · `1.5k` · `2k` · `4k` · `match_input`) or `width` + `height` · `safety_tolerance` 0–7 · `grounding` (web search, default true). Schema `additionalProperties: false`; no `seed` · `output_format` · `webhook`. Response `{id, polling_url, cost, input_mp, output_mp}`. Poll GET `polling_url` with `x-key` ≈0.5 s; `status: "Ready"` → `result.sample`, a signed URL that EXPIRES after 10 minutes; `Error` · `Failed` end it. FLUX.2 same flow, references as `input_image`, `input_image_2`, … ≤8. https://docs.bfl.ml/api-reference/utility/generate-an-image-with-flux-3.md · https://docs.bfl.ml/flux_2/flux2_image_editing.md

```js
const headers = { "x-key": KEY, "Content-Type": "application/json", accept: "application/json" };
const { polling_url, cost } = await (await fetch("https://api.bfl.ai/v1/flux-3-image", {
  method: "POST", headers,
  body: JSON.stringify({ prompt: "Person from ref_image_0 wearing the jacket from ref_image_1", images: [url0, url1], resolution: "2k", grounding: false }),
})).json();
let polled;
do {
  await new Promise((resolve) => setTimeout(resolve, 500));
  polled = await (await fetch(polling_url, { headers })).json();
} while (!["Ready", "Error", "Failed"].includes(polled.status));
const png = await (await fetch(polled.result.sample)).arrayBuffer();
```

Masked inpainting = FLUX.1 Fill pro, $0.05: https://docs.bfl.ml/api-reference/models/inpaint-an-image-with-flux1-fill-[pro]-using-an-input-image-and-mask.md

### fal — queue

`POST https://queue.fal.run/{model_id}`, `Authorization: Key $FAL_KEY` → `{request_id, status_url, response_url}`. GET `status_url` → `IN_QUEUE` · `IN_PROGRESS` · `COMPLETED`; **a failed request also reports COMPLETED**, read the payload. GET `response_url`. Sync twin `https://fal.run/{id}`. FLUX 3 on fal: `{prompt, image_urls[≤10], aspect_ratio, resolution, output_format, sync_mode}` → `{images: [{url, content_type}]}`. https://docs.fal.ai/model-apis/model-endpoints/queue · https://fal.ai/models/fal-ai/flux-3-image/edit/llms.txt

### Replicate

`POST https://api.replicate.com/v1/models/{owner}/{name}/predictions`, Bearer, `Prefer: wait` (≤60 s, `wait=N`), then poll. Per-model input schemas, none verified. https://replicate.com/docs/topics/predictions/create-a-prediction.md

### ComfyUI — local HTTP

| route | use |
|---|---|
| `POST /prompt` | submit a workflow → `{prompt_id, number}` or `{error, node_errors}` |
| `GET /history/{prompt_id}` | outputs as filename · subfolder · type |
| `GET /view?filename=&subfolder=&type=output` | download |
| `POST /upload/image` · `POST /upload/mask` | inputs |
| `GET /ws` | progress |
| `GET /object_info` | node types |
| `POST /interrupt` | stop |

Body `{prompt: <API-format workflow JSON>, client_id}` (from the examples page, UNVERIFIED on the routes page). https://docs.comfy.org/development/comfyui-server/comms_routes.md · https://docs.comfy.org/development/comfyui-server/api-examples

## 3. strengths by task

- **text-instructed editing**: OpenAI Sunburst leads both arenas; then MAI-Image-2.7-Preview (no public API checked), Nano Banana 2.1. Per-task (September snapshot): Seedream 5.0 Pro #1 identity-preserving edits, GPT Image 2 #1 object-level edits https://superpowerdaily.com/posts/artificial-analysis-rebuilds-image-editing-arena-with-different-leaders-by-task
- **pure generation**: GPT Image 2.6 Sunburst → 2.5 → Nano Banana 2.1 · MAI-Image-2.6. Cost per quality: Nano Banana 2.1 ($0.034) · FLUX 3 Klein ($0.009).
- **typography**: Ideogram 4.5 best at correcting text already in an image; GPT Image 2.5 better at writing new text in one small test https://fuser.studio/articles/ideogram-4-5-vs-gpt-image. Google claims Gemini "excels at rendering text"; BFL markets FLUX.2 flex for typography. Recraft V4.1 is design/vector https://www.recraft.ai/docs/recraft-models/recraft-v4-1 (standing UNVERIFIED).
- Stability AI: not checked.

## 4. open weights · Apple Silicon

| model | license | editing | Mac path |
|---|---|---|---|
| FLUX 3 Image Klein (5.6B) | FLUX Kommunity: free commercial under $5M revenue | ✓ 10 refs, bounding boxes | mflux native (Q4–Q8 · BF16 from mflux-community); diffusers `ModularPipeline`; ComfyUI `flux-3-image-klein-comfy` |
| Qwen-Image-Edit-2511 | Apache 2.0 | ✓ | `mlx-community/qwen-image-edit-2511-8bit` via mflux; BF16 ≈57 GB |
| Qwen-Image-2.1 (2026-09-20) | research / non-commercial | ✓ 10 refs (community) | community MLX only |
| FLUX.2 dev · klein 4B · 9B | dev + 9B non-commercial; 4B Apache 2.0 | ✓ (dev: 6 refs) | mflux `mlx-community/FLUX.2-klein-4B-bf16` |

https://docs.bfl.ml/flux_3/flux3_image_klein.md · https://venturebeat.com/technology/black-forest-labs-opens-flux-3-image-klein-weights-with-free-commercial-use-limited-to-smaller-businesses · https://github.com/mflux-community/mflux · https://huggingface.co/mflux-community/flux-3-image-klein-mflux-q8 · https://huggingface.co/mlx-community/qwen-image-edit-2511-8bit · https://modelfit.io/blog/qwen-image-2-1-mac-apple-silicon/

BFL names the RTX 3090 as Klein's lowest card; Mac memory and speed UNVERIFIED (one M5 32 GB report https://github.com/devin-lai/flux-3-image-klein-mlx). mflux is CLI + Python, NO HTTP server: a local provider = ComfyUI's API or a wrapper around mflux.

## 5. leaderboards

Artificial Analysis image editing v2.1 https://artificialanalysis.ai/image/leaderboard/editing

| # | model | Elo |
|---|---|---|
| 1 | GPT Image 2.6 Sunburst (max) | 1209 |
| 2 | GPT Image 2.6 Flare (max) | 1206 |
| 3 | GPT Image 2.5 Sunburst (max) | 1199 |
| 4 | MAI-Image-2.7-Preview | 1195 |
| 5 | GPT Image 2.5 Flare (max) | 1182 |

then Krea 3 Ultra · Nano Banana 2.1 (1152).

Artificial Analysis text-to-image https://artificialanalysis.ai/text-to-image/arena/leaderboard-text

| # | model | Elo |
|---|---|---|
| 1 | GPT Image 2.6 Sunburst | 1259 |
| 2 | GPT Image 2.6 Flare | 1228 |
| 3 | GPT Image 2.5 Sunburst | 1227 |
| 4 | GPT Image 2.5 Flare | 1208 |
| 5 | GPT Image 2 (high) | 1188 |

then Nano Banana 2.1 (1176) · MAI-Image-2.6 (1168).

LMArena image edit, mirror snapshot 2026-11-08 https://models.fru.dev/boards/lmarena-image-edit

| # | model | score |
|---|---|---|
| 1 | GPT Image 2.5 Sunburst | 1517 |
| 2 | GPT Image 2.5 Flare | 1483 |
| 3 | GPT Image 2.6 Sunburst (Medium) | 1476 |
| 4 | MAI-Image-2.7-Preview | 1467 |
| 5 | GPT Image 2.6 Flare (Medium) | 1462 |

Nano Banana 2.1 #8 (1427). LMArena text-to-image top 5 UNVERIFIED (arena.ai 403).

## 6. the agent's recommendation

**Provider 1 — OpenAI Image API, `gpt-image-2.5-sunburst` / `2.6-sunburst`.** #1 on both edit boards; the only hosted API with a real **mask** + **markup**; 16 references; sync with partial images; ≤4K, transparent, svg · gif out; one endpoint pair covers generate · edit · inpaint · variation. ≈$0.21 per 1024² at max; `gpt-image-1-mini` $0.005–$0.036 for drafts. Use `/v1/images/*`, not Responses, so the dialogue model stays the orchestrator.

**Provider 2 — BFL direct, FLUX 3 Image + Klein for drafts.** Independent second opinion for edits and composition, ≤10 references FREE, bounding-box layout, $0.048 (1K) · $0.009 (Klein); async = one submit-and-poll; upscaler + Fill pro for masks; the SAME family runs locally.

**Runner-up — Google `gemini-nano-banana-2.1` ($0.034).** Best quality per dollar, 14 references, conversational edits; no mask, SynthID on every image.

**fal instead of BFL direct** when one key for FLUX 3 · Seedream 5 Pro · Ideogram 4.5 · Qwen-Image-Edit-2511 matters; same queue pattern.

**Local — FLUX 3 Image Klein through ComfyUI's HTTP API** (`/upload/image` → `/prompt` → `/ws` | `/history` → `/view`): masks, multi-reference, upscaling as workflows. Qwen-Image-Edit-2511 (Apache 2.0) if the Kommunity revenue limit matters.
