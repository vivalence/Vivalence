---
paths: ["subsystems/paladin/**"]
---
<!-- writer: agent · derived-from: subsystems/paladin + corpus read · verified: session c795a2f7 · limit: 30 lines -->
# codemap: paladin — composition compiler (singleton, never runs anything)

- **boot** (`mod.js`, grounded 13 lines): `new Paladin()` → `populate.env` (VIVA_*/PUBLIC_* → `paladin.env`, SECRET_VIVA_* → `paladin.secret`; optional `VIVA_ENV_FILE` dotenv) → `populate.scopes` (conditional-Proxy resolvers: system/repository/registry/variant/environment/mountpoint) → citizen: `integrate.statements`. `variant.mount()` is LAZY (`fn.once`): environment jsonc-fold → resolve (find.type variant marker, hydrate, Mask daemons/services) → validate (v circuitry casts) → `publish()` (PUBLIC_* → Deno.env).
- **prototypes**: Paladin (env/secret/variant/system) · Vip (`mount` walk→register, `accio/accioMany/accioMap`) · Pensieve (nested Map owner→type→slug→version; `revelio` descent, `latest` semver fold) · System (spawn, `~/.viva/locks/<type>_<slug>.lock`, `lock.alive()` via SIGCONT).
- **PRIMITIVES — never hand-roll**: `paladin.find.viva(dir)` · `paladin.read.viva(path)` · `paladin.vip.accio(query)` · `paladin.vip.accioMap(obj)` · `cast.lookup("@owner/type/slug@ver")`.
- **M11 pending** ([[m11_packages.quest]]): owner = package identity; `vip.mount` reads `package.viva.js` + stamps owner; loader folds `variant.packages`; kill the owner default in `pensieve.register:12`.
- deploy: local = testament mounts · docker = `VIVA_*_MOUNT` envs, no testament in image.
