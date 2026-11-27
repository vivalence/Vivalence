---
paths: ["deno.jsonc", ".gitlab-ci.yml", "commons/datamaps/**", ".ikiro/cut/**"]
---
<!-- writer: agent · limit: 3000 chars · code is the map · how a version is named, published and heard -->
# codemap: release

## the version

- A rolling version is `YYYY.MM.N`: the month is two digits, `N` counts the publishes of that month from 0.
- An LTS version is `N.N.N`. Nothing in the tree publishes one yet.
- The one source is `deno.jsonc:2`. The tag is `v` + that version, never typed from memory.
- A published version is never published again. A fix is `N + 1`.
- Each release has one file, `.ikiro/cut/<version>.org`.

Two versions are held against each other by `belt.release.parse` · `compare`: three numbers, a `v` in front throws.

Three readers: paladin's boot (`paladin.version`, kept as written), the datamap's stamp on a mount (`vivalence@<version>`), the pipeline.

## the names

| name | moves |
|---|---|
| tag `v2026.11.1` | never |
| image `:v2026.11.1` | never |
| image `:2026.11` | on every tag of that month |
| image `:alpine` · `:<sha>` | on every pipeline |

A pipeline starts on a tag `vYYYY.MM.N` only (`.gitlab-ci.yml:3`). A branch push builds nothing.

On a tag the pipeline stops before the first build when the tag is not `v` + the version.

`deploy-anima` · `deploy-runtime` exist only when GitLab holds `COOLIFY_TOKEN` and `COOLIFY_BASE`, unprotected: then a tag's push deploys prod.

## publishing

He runs it, one push per remote.

```sh
jj describe -m "release v2026.11.1"
jj new
jj tag set v2026.11.1 -r @-
git push origin v2026.11.1
git push github v2026.11.1
sh .ikiro/methods/registry.sh v2026.11.1 2026.11 alpine
```

Published means the last line prints one digest per image under all three names. The next version is written into `deno.jsonc` before the next change lands.

## a migration step

An entity's twitch opens a step under the release that needs it.

```js
// subsystems/typology/entities/Surface.ts:112
const twitch = new Vector().open("/before/datamap/migrate/2026.11.0", (ctx) =>
  ctx.migrate.renaming("View", "Surface"),
);
```

- A mount hears every release above its stamp up to the booted version, once, in order, then is stamped.
- A fresh mount is stamped and hears none. An unstamped mount stands at `0.0.0`.
- A rollback stamps backward and hears the older release's steps again: a step returns clean on a mount that already has its change.
- The walk is probed by `.ikiro/reference/migration-twitch/release.probe.js`. No suite holds it.
