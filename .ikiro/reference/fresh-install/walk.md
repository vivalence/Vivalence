# fresh install — the walk on ubuntu 24.04 (docker), 11-26

What ran, in order, each line read off its output. The kit that ran it sat in a session scratchpad and is gone after a reboot; this file is the record.

## the image

```dockerfile
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip git sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends vim ranger
RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y
ENV PATH="/root/.deno/bin:$PATH"
WORKDIR /viva/repository
COPY deno.jsonc deno.lock import_map.json ./
COPY systems/ ./systems/
COPY subsystems/ ./subsystems/
COPY commons/ ./commons/
COPY documentation/deno.jsonc ./documentation/deno.jsonc
RUN deno task embed
```

The second apt line is for a walk by hand (an editor, a file browser), not for viva. No compiler is needed: argon2 hashed an admin's password in this image.

## the routine, no form

```sh
viva --help >/dev/null
viva ledger/install ~/.viva
viva registry/tap <assembly: path | git url>
viva registry/tap <droneaid: path | git url>
viva instance/clone @droneaid/instance/droneaid --install
viva instance/use droneaid --ledger
viva instance/doctor
viva instance/start
```

Between the lines, by hand:

- `~/.viva/ledger.viva.json`: `lighthouse.traits` `["AUTOSIGNUP"]`, `hallucinators` one openrouter row with one `dialogue` faculty.
- `~/.viva/.env`: `SECRET_VIVA_OPENROUTER_API_KEY`.
- `~/.viva/instances/droneaid/.env`: `VIVA_RUNTIME_ORIGIN` · `VIVA_CLIENT_ANIMA_ORIGIN` (the bind, `http://0.0.0.0:<port>`) · `PUBLIC_VIVA_RUNTIME_REMOTE` (what a browser reaches).

## the routine, the forms

In a tty: `viva ledger/install` (two fields, persists `VIVA_LEDGER_MOUNT` in `~/.config/viva/env`), then `viva instance/clone droneaid --use --install` (environment page, boot, admin, confirm, teardown). Ran on the default ledger, exit clean.

## what answered

- `GET :4501/beacon/status` → `{"code":"RUNNING"}`.
- `POST :4501/lighthouse/autosignup {"username"}` → `SUCCESS`; `/lighthouse/signup` → `null` (not grafted).
- anima `:4794`: a name, no password; the terminal sits in `[player ‹guide/player›]`.
- A question in that thread: five tool calls, an answer naming step 6's bolts.

## what the walk found

Filed in `.ikiro/known-issues.org`: `home-seats-a-thread-no-guide-open` · `install-docs-name-dead-commands`.

- A dialogue-only ledger leaves every `CONVERSATION` mode reported dormant; text works.
- `instance/start` serves anima as vite dev. The nginx bundle of `systems/anima/Dockerfile` was not walked.
- The packages were tapped by path, never by git url.
- `@commons/home/console` lives under `commons/fixtures`, which `.dockerignore` drops; nothing in the walk read it.

## a HOME reference

The client seats a terminal by matching the reference against its hosts:

```js
// systems/ghost/subjects/client/traits/home.js:8
    const owner = [clientDie.runtime, ...clientDie.runtime.entities.daemon.$entities.get()].find((held) => home.startsWith(`${held.reference.absolute}/`));
// systems/ghost/entities/daemon/hydration.js:6
  ctx.entity.reference = new Path(`/daemon/${ctx.entity.slug}`);
```

A runtime mode is `/runtime/runtime/mode/<type>/<slug>`, a daemon mode `/daemon/<slug>/mode/<type>/<slug>`. A telemetry sieve path (`/runtime/runtime/daemon/<slug>/…`) is another address and seats nothing.

## second walk, 11-26, after the scaffold and `--instance` fixes

Image rebuilt from the tree, clean container, all 25 commands run, most with a wrong input too.

Holds: ports and the key set only in `~/.viva/.env` reach the instance (doctor stratum `ledger`); `--instance=<slug>` selects; nothing selected is said by `install · stop · start · up · down`; a tap by https url clones into the store; `start` · `start runtime` · `stop` · `up --logged` · `down`; autosignup refuses a name that holds a password.

Breaks or surprises:

- `instance/install <user> <pass>` on a lighthouse with only `AUTOSIGNUP`: `404 @ /lighthouse/signup`, exit 1. So does `instance/lighthouse/signup`.
- `instance/clone` (exists · no match), `instance/rename` and `instance/delete` on a missing slug print `error …` and exit 0.
- `instance/clone hello-world /srv/placed` is refused while slug `hello-world` is recorded, target or not.
- `instance/use <other> doctor --ledger` runs the doctor on the session's instance, not `<other>`.
- `instance/down` sent in the seconds after the beacon first answers: `still holds the lock after 15 s`, exit 1, instance stays up. A minute later it stops clean.
- `viva` · `viva chrome` in the image: `Module 404 @commons/home/console` (`.dockerignore` drops `commons/fixtures`).
- `instance/tail` · `instance/pipe`: the recipe names no `telemetry.logger.socket`; not walked further.
- `registry/tap file:///…` is read as a store path.
- autosignup takes any string as a name (`A b!`), and signs anyone in as an existing name that holds no password.
- The player thread answers and lists three guides, then says to pick one from the screen; the screen is empty.
