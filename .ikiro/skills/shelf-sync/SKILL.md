---
name: shelf-sync
description: >-
  A mode edited in the checkout or the registry is half-landed once a shelf instance exists — the runtime
  bundles ~/.viva/instances/<slug>/, a COPY made once by instance/create that no verb syncs. diff -q every
  touched file source↔shelf, sync by hand, verify by bundling the SHELF entry. Use after editing a mode that
  has an instance, and when a served page contradicts a passing check.
when_to_use: >-
  "still" (beef, after a reported fix) · "why didn't my fix show up?" · a served page contradicts a passing
  check · after `viva instance/create` · editing any mode under a package that has `~/.viva/instances/<slug>/` ·
  before any claim about a rendered view.
---

# shelf-sync — the runtime bundles the shelf, not the checkout

Canon: `systems/ghost/trajectories/instance/create.js:38-41` (`clone.tree(mount, destination)` — a copy, once) · `feedback_flag_day_radius` (*"the radius includes MY OWN edit loop"*) · Scoreboard `instance-drift`. beef, one word after a reported theme fix: *"still"*. Measured 09-22 with `diff -q`: chess and droneaid differ from their templates in BOTH `instance.viva.js` and `daemon.js`; media is identical. The droneaid drift changes the kernel list.

## The check — before any claim about a rendered view

```sh
S=~/.viva/registry/<pkg>/modes/<type>/<slug>   # or the repo path for a checkout mode (commons/instances/hello-world)
T=~/.viva/instances/<instance>/<the same relative path>
diff -q "$S/<file>" "$T/<file>"                 # per touched file — a differing file is the served one
```

Two sources of truth exist by design: the package/checkout is the TEMPLATE, the shelf is what `viva instance/run` and the runtime read. `~/.viva/instances/<slug>/instance.viva.js` legitimately differs (ledger-recipe slimming lives on the shelf only — 27 lines vs the 65-line template) — sync FILES you edited, never blind-overwrite the instance declaration.

## Sync — no verb exists

1. capture the shelf pre-image: `~/.viva/instances` has no VCS → `~/.viva/bak/instances/<slug>-<YYYYMMDD>/…` ([[capture-before-delete]]).
2. `cp` the touched files source → shelf (by name; never `rsync --delete`).
3. verify on the SHELF entry — bundle it (`paladin.bundler(<shelf entry>).bundle()`) or reload the page: in `VIVA_SYSTEM_MODE=DEVELOPMENT` the runtime re-bundles at `/metadata/application`, so a synced shelf needs a page RELOAD, not a restart; a buffer-VIEW change through `runtime/run` needs a RESTART (mode bundles are cached).
4. say which artifact the claim is about: *"verified on the shelf bundle"*, never *"verified"*.

## Two ways to get this wrong — both in the ledger

- **verified the checkout, served the shelf** — a passing check beside an unchanged page (#11, `family: shelf-drift`).
- **rsynced a shelf while the runtime served the repo** — harmless and pointless (#8: the watcher was on a repo path). Ask which one `viva instance/doctor --json` → `mount` names.

A live sibling may have written the repo minutes ago and left the shelf stale — that is the sibling's bug you will meet first ([[sibling-reconcile]]).
