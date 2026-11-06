<!-- limit: 6000 chars · measured 2026-11-11 17:43–17:50 CET on R000, read-only bar ONE staged file · quest: .ikiro/quests/prod-deploy.org -->
# prod: reader + darkroom + openrouter — STAGED 11-11, not live

beef: /"add the reader and darkroom modes to my prod instnace config. validate that openrouter is provided. also, lets do a review on the available models on prod."/

## what is on R000

- container `runtime-egcwkgw0cwg0kkwko4owooco`: image built 11-09 15:44 from `runtime:alpine` = commit `42fd3068` (registry digest `sha256:f6b63651…`, same for both tags). `RUNNING`.
- the image holds NO `commons/reader/`, NO `commons/editors/`; its openrouter table has no painters.
- `.env`: 3 keys (`SERVICE_NAME_RUNTIME` · `SECRET_VIVA_JWT` · `SECRET_VIVA_ANTHROPIC_API_KEY`), no trailing newline.
- `instance/instance.viva.jsonc` (md5 `59ef089f…`): his 17:41 edit comments out nyan · riddler · comando · cocina; the running container still serves them (booted 11-09).
- `instance/instance.viva.jsonc.next` (md5 `c0d6d866…`): MINE, the live file plus the two hunks below.

```diff
// R000 /data/coolify/services/egcwkgw0cwg0kkwko4owooco/instance/instance.viva.jsonc.next
-    "modes": ["@commons/harness/runtime"]
+    "modes": ["@commons/harness/runtime", "@commons/editor/darkroom", "@commons/reader/reader"]
…
         "key": "${SECRET_VIVA_ANTHROPIC_API_KEY}"
       }
+    },
+    {
+      "module": "@commons/hallucinator/openrouter",
+      "secrets": {
+        "key": "${SECRET_VIVA_OPENROUTER_API_KEY}"
+      }
     }
```

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
