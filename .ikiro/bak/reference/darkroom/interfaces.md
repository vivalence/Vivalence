<!-- limit: 40000 chars · research 2026-11-08, one opus agent, 48 fetches · reference, read-only · (3p) = third-party source only · UNVERIFIED = the agent found nothing primary · quest: .ikiro/quests/m118-darkroom.org -->
# interfaces — AI image editors, 2026-11-08: the interactions worth stealing

Midjourney · OpenAI · Adobe help pages returned 403; their rows rest on update posts and secondary sources.

## 1. products

| product | paradigm | region edit | refs / style | history | agentic |
|---|---|---|---|---|---|
| ChatGPT Images (GPT Image 2) | chat + Images tab | Select brush → prompt | multi-image in chat; style presets | thread + persistent Images tab | ✓ model calls an image tool |
| Gemini app (Nano Banana 2 · Pro) | chat | Mark Up: draw or write ON the image | multi-image | thread | ✓ |
| Krea Agent | chat + files + generations + media editor | annotate in media editor | context library (My · Workspace) | session files | ✓ plans, picks a model, self-reviews |
| Krea Realtime | canvas | paint, live | uploads | none | ✗ |
| Krea Nodes | node | per node | style node | cached nodes, partial rerun | Node Agent + MCP |
| Flora + FAUNA | node canvas | Image Editor node | Techniques | graph | ✓ Assist · Auto |
| Figma Weave (was Weavy) | node | Mask · Inpaint · Painter nodes | ref nodes | graph | UNVERIFIED |
| Freepik Spaces | node | per node | upload nodes | graph | Assistant node (text) |
| ComfyUI | node + App Mode | mask editor | any (LoRA · IP-adapter) | queue + /history | ✗ API only |
| Invoke | canvas + layers | inpaint mask · regional guidance | regional reference image | Staging Area → commit | ✗ |
| Midjourney web | grid + editor | Smart Select · erase · layers | --sref · moodboards · --p · --oref | job grid, vary trees | conversational prompt mode |
| Ideogram Studio | canvas + layers | Select area brush | AI edit ≤14 refs | version strip | Magic Prompt |
| Recraft | canvas | ✓ (UNVERIFIED detail) | **Style objects** (id · refs + weights) | canvas | MCP server |
| Adobe Photoshop · Firefly Boards | layers · board | Generative Fill selection | reference image · presets | 3 variations per run | ChatGPT plugin |
| Leonardo | canvas + stream | Inpaint/Outpaint · strength | Elements (UNVERIFIED) | Flow State stream | ✗ |
| Lovart | chat + canvas | Mark mode · Touch Edit | brand kit (3p) | canvas | ✓ |
| Google Mixboard | board | via chat | board images | board | ✓ Nano Banana |
| Magnific · Topaz | single shot | — | — | — | ✗ |
| Playground | UNVERIFIED | | | | |

## 2. the concepts, by the best two or three

### a · history and versions

- **Midjourney grid.** Each job = 4 images; under each: **Vary (Subtle)** · **Vary (Strong)** · **Upscale (Subtle · Creative)** · **Vary Region**. Every click = a new job pointing at its parent: an implicit TREE shown as a flat feed. Draft mode (`--draft`, V8.1) = 24 low-res per job, **Enhance** re-renders one. https://updates.midjourney.com/draft-mode-for-v8-1-and-new-feature-previews/ · https://updates.midjourney.com/editor-improvements-a/
- **Ideogram Studio version strip.** Every canvas run adds a thumbnail; click or ←/→ switches; **undo also undoes a version switch**; **+** duplicates the version with its layers; layer tools edit the version IN PLACE, so duplicate first. Linear strip + explicit fork. https://docs.ideogram.ai/edit/studio
- **Invoke Staging Area.** Results land in a tray; the canvas is LOCKED until **Accept** (commit as a raster layer) · save · discard. Nothing touches the canvas unaccepted. https://support.invoke.ai/support/solutions/articles/151000096682-control-canvas
- **Photoshop Generative Fill.** 3 variations per run, clicked through and rated in Properties; they stay in the generative layer. (3p) https://dupple.com/learn/how-to-use-generative-ai-in-photoshop
- **Node tools.** The graph IS the history: change a node, "only the affected downstream nodes rerun". https://www.krea.ai/blog/ai-workflow-agent

### b · style references and moodboards

- **Midjourney.** `--sref <code|url>` + `--sw` 0–1000 (default 100) + `--sv`; **moodboards** = a user image set as one style token (not with `--sw` · `--sv`); `--p` personalization learned from ratings, "your default selections are added to every prompt"; `--oref` / `--ow` one object or character image, dragged into the omni-reference slot. (3p, UNVERIFIED) V8.2's Edit Model replaces oref · cref · Retexture. https://docs.midjourney.com/docs/style-reference · https://updates.midjourney.com/omni-reference-oref/
- **Recraft.** **A Style is a first-class object with an id**: Style → Create style → 1–10 reference images, a weight slider EACH, an interpretation mode (style only | style and composition), save; My styles (Created by me · Liked) · Explore; applied as **Precise** | **Flexible**; the API returns a `style_id` reusable across V4 models of one output type; the MCP server has `create_style`. https://www.recraft.ai/docs/recraft-studio/styles/overview · https://www.recraft.ai/docs/recraft-studio/styles/custom-styles/how-to-create-a-custom-style · https://docs.comfy.org/built-in-nodes/RecraftV4CreateStyleNode.md · https://glama.ai/mcp/servers/@recraft-ai/mcp-recraft-server/tools/create_style
- **Krea Agent.** A persistent **context library**, My · Workspace scopes; the agent reads it, makes folders, moves files — references behave like a filesystem. https://www.krea.ai/blog/what-is-krea-agent

### c · region selection

- **ChatGPT.** Click image → **Select** brush → paint → type. Selection size steers the result (a whole head → oversized sunglasses; the eyes → right). In the API the mask is "entirely prompt-based": guidance, not a pixel cut. https://www.datacamp.com/blog/chatgpt-images · https://developers.openai.com/api/docs/guides/image-generation.md
- **Gemini Mark Up.** Tap → Mark Up → **draw or write text ON the image** → Done → prompt. The annotation IS the instruction; no binary mask. (news) https://www.tomsguide.com/ai/ai-image-video/nano-banana-now-lets-you-draw-prompts-directly-on-your-photos-sam-altman-is-going-to-hate-this
- **Midjourney Smart Select.** Include points · exclude points → **Erase Selection** | **Erase Background** → submit with a prompt; with layers only transparent areas regenerate. https://updates.midjourney.com/editor-improvements-a/
- **Invoke regional guidance.** Each mask layer carries **its own prompt and/or reference image**; colour is display only; all enabled masks + raster layers flatten to one mask + one image before generation. https://www.invoke.com/post/introducing-control-layers-a-powerful-ui-for-applying-regional-prompts
- **Lovart Mark mode.** Click an ELEMENT, describe in the agent panel; one prompt targets several marked objects; **Edit Elements** splits a flat image into movable layers. https://www.lovart.ai/features/ai-design-canvas

### d · many images into one

- **OpenAI Responses**: N input images (URL · base64 · File ID) + text, "4 references → a gift basket". https://developers.openai.com/api/docs/guides/image-generation.md
- **Ideogram AI edit**: paperclip ≤14 references, **Count** 1–4 outputs. https://docs.ideogram.ai/edit/studio
- **Midjourney**: an image is TYPED by the slot it lands in — image prompt · `--sref` style · `--oref` object.
- **Mixboard**: select several board images → combine · edit · **more like this** · regenerate. https://techcrunch.com/2025/09/24/google-launches-an-ai-powered-mood-board-app-mixboard/

### e · the iteration vocabulary

| word | who | means |
|---|---|---|
| vary subtle · strong | Midjourney | sibling at low · high denoise |
| vary region | Midjourney | inpaint with a mask |
| remix | MJ · Ideogram (Strength 1–4) | new prompt, parent as init |
| retexture | MJ V7 | keep structure, change surface |
| pan · zoom out · extend | MJ · Ideogram | outpaint |
| magic fill · select area · generative fill | Ideogram · Adobe | inpaint |
| upscale subtle · creative | MJ; Magnific Creativity · Resemblance · HDR; Topaz Creativity · Texture | resolution, with or without invention |
| enhance | MJ draft · Krea | draft → full |
| describe | Ideogram · Firefly Boards | image → prompt |
| more like this · regenerate | Mixboard | reroll in the same style |
| restore · icon | Nano Banana Gemini CLI extension | purpose-made commands |

(3p) https://help.scenario.com/articles/8823252319-magnific-upscaling-the-essentials · https://awesome.ecosyste.ms/projects/github.com%2Fgemini-cli-extensions%2Fnanobanana

### f · the file and project model

- **board · canvas**: Firefly Boards (infinite board, artboards, presets, Describe Image) · Mixboard · Freepik Spaces (comments pinned to frames or nodes) · Ideogram Studio (canvas → layers → versions). https://www.creativebloq.com/ai/firefly-boards-is-fast-becoming-adobes-most-interesting-app · https://www.businesswire.com/news/home/20251104023735/en/Freepik-Launches-Freepik-Spaces-to-Power-AI-Visual-Creation-and-Collaboration-in-Real-Time
- **session**: Krea Agent = chat + file panel + generations panel + media editor + an attached computer (Python · FFmpeg · ImageMagick).
- **library**: the ChatGPT Images tab replaced the old library — "persistent items rather than buried in chat history".
- **published workflow**: Weave Output node → Publish → "Design App"; ComfyUI App Mode + App Builder (2026-03); Flora **Techniques** (reusable sub-graphs). https://www.figma.com/blog/connecting-figma-and-weave/ · https://www.gigazine.net/gsc_news/en/20260312-comfyui-app-mode · https://docs.flora.ai/nodes/techniques

### g · prompt handling

- **the LLM rewrites**: OpenAI returns `revised_prompt` per `image_generation_call`; Ideogram `magic_prompt` AUTO; Krea Agent's orchestrator writes the prompt per model.
- **conversational**: Midjourney's chat-bubble button; voice with Draft mode.
- **describe**: image → text pre-fills the Remix box (Ideogram · Firefly Boards).
- **negative prompts** survive only in diffusion-native tools (ComfyUI · Invoke · Leonardo); no 2026 negative-prompt UI found in ChatGPT · Gemini · Krea Agent (absence UNVERIFIED).
- **model choice by the agent**: Krea Agent picks Nano Banana Pro for edits, GPT Image 2 for text-heavy, Krea 2 for exploration, Topaz for upscaling; an **effort** setting (Instant · Medium · High · Extra High) sets planning and self-review.

### h · how chat and canvas share state — the part to copy

- **Flora FAUNA**: selected nodes are **added to the next message automatically** (≤15); **`@`** opens a node picker; **Assist** shows the nodes it will run + credit cost, nothing runs unapproved; **Auto** runs; FAUNA adds nodes, changes prompt · model · aspect, rewires, groups, lays out, runs ≤50 nodes. API `GET /graph` · `PUT /canvas/definition` · `POST /canvas/changeset`. (secondary, UNVERIFIED) the canvas is serialized as Mermaid for the agent. https://docs.flora.ai/editor/fauna · https://docs.flora.ai/api/reference/canvas.md
- **Krea Node Agent**: a plan of stages first, per-node cost, swap models or drop stages; nodes appear a layer at a time; it **reads existing nodes and earlier outputs**, reuses a style node from a previous session. Multiplayer: "the Agent and MCP clients modify projects through the same operations human editors use", last write wins per field. https://www.krea.ai/blog/ai-workflow-agent · https://www.krea.ai/blog/multiplayer-nodes
- **OpenAI Responses**: the conversation IS the state — `previous_response_id` or an earlier call id; `action: auto | generate | edit` (`edit` errors with no image in context); `partial_images` 0–3; `input_image_mask` on the FIRST input image.
- **Adobe plugin in ChatGPT (2026-09-29)**: select a region in an embedded editor, ask the chat, fine-tune with sliders (hue · saturation · contrast) — chat and a direct-manipulation widget act on ONE object. https://blog.adobe.com/en/publish/2026/09/29/openai-devday-2026-introducing-hands-on-editing-adobe-plugin-chatgpt

## 3. agentic editing — research and MCP

- RefineEdit-Agent (plan → edit → LVLM critique loop; LongBench-T2I-Edit, 500 images) https://arxiv.org/abs/2508.17435
- Agent Banana (layer-aware, **rollback-safe** 4K edits) https://arxiv.org/html/2602.09084v2
- EditAgent (the agent is bounded by its action space and by what its JUDGE can see; a general editor gave "no usable result in over 40%") https://arxiv.org/abs/2610.39664
- WeAgent-MMGenEdit https://arxiv.org/abs/2609.05171 · survey https://arxiv.org/pdf/2609.06758
- **model behaviour**: FLUX.1 Kontext — artifacts build up after ≈6 edits; one change per turn, save intermediates. https://bfl.ai/blog/flux-1-kontext · https://arxiv.org/abs/2506.15742. Nano Banana 2.1 (2026-10) claims better multi-turn consistency https://deepmind.google/models/model-cards/nano-banana-2-1/. Qwen-Image-Edit multi-turn UNVERIFIED.
- **MCP servers**: BFL official `claude mcp add --transport http FLUX https://mcp.bfl.ai` (3p https://masonry.so/blog/best-cli-tools-generate-images-claude-code) · Replicate official https://replicate.com/changelog/2026-02-10-mcp-server-auto-discovery · fal community only (`@fal-ai/mcp` UNVERIFIED) · Recraft official (`create_style`) · Krea Nodes MCP. Claude has no native image generation.

## 4. the agent's proposal — the smallest coherent concept

Seven nouns cover ≈90% of these products.

| noun | is | from |
|---|---|---|
| **board** | the shared space (canvas + thread) where every image has an address | Firefly · Mixboard · Spaces |
| **image** | one immutable rendered result, with `parent` and `params` | MJ jobs · Ideogram versions |
| **version** | the head pointer of a lineage; switching it is undoable | Ideogram strip |
| **reference** | an image bound to a role `subject · style · scene · init`, with a weight | MJ oref/sref · Recraft |
| **style** | a saved, named set of references with weights and an id | Recraft style · MJ moodboard |
| **region** | a mask OR an annotation on an image, carrying its own prompt and refs | ChatGPT Select · Gemini Mark Up · Invoke regional |
| **proposal** | a staged batch of N candidates waiting for accept or discard | Invoke Staging · PS variations · FAUNA Assist |

Six tools:

```
generate(prompt, references[], n)          → proposal
edit(image, prompt, mask?, references[])   → proposal
vary(image, strength: subtle|strong, n)    → proposal
extend(image, box)                          → proposal
upscale(image, creativity)                  → image
accept(proposal, pick) · describe(image)    → version · prompt
```

Three rules for chat and board:

1. **Selection is context.** What is selected on the board goes into the next chat turn automatically; `@name` addresses it from the chat (FAUNA).
2. **The agent and the human act through the same tools** (Krea multiplayer). A click and a tool call land as the same event in the history.
3. **Nothing mutates without a proposal.** Every tool call stages candidates with cost and `revised_prompt`; accepting advances the version — undoable history (Ideogram) · branching (MJ vary) · safe rollback (Agent Banana) from one mechanism.

Retexture · remix · reroll are not new nouns: retexture = `edit` without a mask, remix = `vary` with a new prompt, reroll = `vary` at low strength.
