<!-- limit: 6000 chars · measured 2026-11-11 17:43–17:50 CET on R000, read-only bar ONE staged file · quest: .ikiro/quests/done/prod-deploy.org -->
# prod: reader + darkroom + openrouter — LIVE 11-11 18:31; the aftermath (two faults, 11-12) is the quest's milestone 9

beef: /"add the reader and darkroom modes to my prod instnace config. validate that openrouter is provided. also, lets do a review on the available models on prod."/

## what is on R000

- container `runtime-egcwkgw0cwg0kkwko4owooco`: image built 11-09 15:44 from `runtime:alpine` = commit `42fd3068` (registry digest `sha256:f6b63651…`, same for both tags). `RUNNING`.
- the image holds NO `commons/reader/`, NO `commons/editors/`; its openrouter table has no painters.
- `.env`: 3 keys (`SERVICE_NAME_RUNTIME` · `SECRET_VIVA_JWT` · `SECRET_VIVA_ANTHROPIC_API_KEY`), no trailing newline.
- `instance/instance.viva.jsonc` (md5 `59ef089f…`): his 17:41 edit comments out nyan · riddler · comando · cocina; the running container still serves them (booted 11-09).
- `instance/instance.viva.jsonc.next` (md5 `c0d6d866…`): MINE, the live file plus two hunks — the diff and every landed hunk live in `quests/done/prod-deploy.org` `* as code` milestone 8.

## why staged — the rehearsal

The `.next` recipe on the CURRENT image, a throwaway container, no published port, fresh volume, wiped after:

```
[instance] hallucinators[1] filtered, @commons/hallucinator/openrouter — empty key
[runtime/runtime] status { code: "FAILED", error: { message: '[registry] Module 404: {"lookup":{"owner":"@commons","type":"editor","slug":"darkroom"}}' } }
t=6s exited exit=1
```

The live recipe with these modes = a crash loop on the next restart (`restart: unless-stopped`). The recipe swaps WITH the image.

## openrouter on prod — NOT provided, two gaps

1. the recipe's `hallucinators` slot is declared, so it replaces the ledger's whole (`subsystems/paladin/instance/lifecycle/1-population.js:25`): anthropic only.
2. `.env` has no `SECRET_VIVA_OPENROUTER_API_KEY`. A blank key filters the hallucinator, boot goes on.

Darkroom paints through `ctx.mode.harness.picture.render` (`commons/editors/darkroom/aperture/index.js:44`); only openrouter supplies `picture`. Reader's `/reader/refine` uses `object.render`: anthropic serves it.

## the deploy, in order

1. HIS `!`: the tree to origin (CI moves `:alpine`) + four registry packages to github. Unpushed product work 11-11: education 17 files · chess 23 · assembly 10 · droneaid 1. Runtime and taps move in lockstep (09-30 · 11-09 skew).
2. HIS: row 4 of `.env`, typed.
3. MINE on his word: rehearse `.next` on the NEW image · backup · `cp .next` over live (bak `-20261111`) · `docker compose build runtime && docker compose up -d --no-build --force-recreate runtime` · S000 anima `pull` + `up -d --force-recreate -V` · proof.

## models, measured 11-11

Anthropic, from inside the prod container with the prod key (`max_tokens: 1` each): `claude-opus-5` 200 · `claude-sonnet-5` 200 · `claude-haiku-4-5` 200 (→ `claude-haiku-4-5-20251001`) · `claude-opus-5-5` 200 · `claude-sonnet-5-5` 200 · `claude-haiku-5-5` 200. The key also lists `claude-fable-5-2` (11-09).

OpenRouter, public catalogs (`/api/v1/models` 466 ids · `/api/v1/images/models`): all seven table ids resolve; `typesafe/jev-1.13` only by `/models/<id>/endpoints` 200, absent from the list. No keyed call made.

Unmeasured: prod's live `/runtime/runtime/metadata/cortex` (401 without a token).

## flags

- reader `/add` fetches any url server-side (`commons/reader/reader/aperture/index.js:21`); the fetch guard is owed (`frontier.md` `reader-mode`). On prod: any logged-in user reaches the docker network through it.
- side effect: `alpine:3.20` pulled onto R000 (the stage copy).

## landed 11-11 17:53–17:58, on /"You can take my open router key and write it into the prod.env file. You can land the actual edit"/

- R000 `.env` row 4 `SECRET_VIVA_OPENROUTER_API_KEY`, copied from `~/.viva/.env` unseen, quotes stripped (`docker run --env-file` keeps them: 401 quoted, 200 bare). Bak `.env.bak-20261111`.
- R000 `instance/instance.viva.jsonc` = the `.next` above (md5 `c0d6d866…`), bak `instance.viva.jsonc.bak-20261111`. The container (booted 11-09) has not read it. A restart BEFORE the new image dies `Module 404`: roll back with `cp instance.viva.jsonc.bak-20261111 instance.viva.jsonc`.
- model ids, tree only (reach prod with his push):

```
commons/hallucinators/anthropic/provider/index.js     claude-opus-5-5 · claude-sonnet-5-5 · claude-haiku-5-5 (context 1000000, thinking true)
commons/hallucinators/anthropic/provider/translate.js structured: tool_choice any → auto, RESPOND.description steers (5.5: 400 on a forced choice)
commons/hallucinators/openrouter/provider/index.js    openai/gpt-6.1-sol (1050000) · google/gemini-3.8-flash · google/gemini-3.5-flash-lite (both thinking true: 400 "Reasoning is mandatory")
                                                      openai/gpt-image-2.6-sunburst (16) · black-forest-labs/flux-3-image (10) · google/gemini-nano-banana-2.1 (14)
commons/editors/darkroom/schematics.js · buffer/Darkroom.jsx   default + the three painters
```

Live, his local keys, through the providers: six dialogue ids plain · object 4/4 · tools+object · stream; three painters one picture each, $0.0237. OpenRouter credit left 11-11: $1.91.

Owed: a darkroom desk saved with `openai/gpt-image-2` · `flux.2-pro` · `gemini-2.5-flash-image` finds no painter until its model is re-picked · effort unset now means `medium` on opus-5-5 and haiku-5-5 (API default; opus-5 was `high`) · no `fallbacks` on refusals · typology `.desc` examples still say `openai/gpt-image-2` (HOLY, untouched).
