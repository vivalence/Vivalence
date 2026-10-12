> Research record 10-19 for m95, written BEFORE the drill. Killed since: "face" → the buffer's component (m95 lock 6); a shared row model across clients (REJECTED, lock 1); "the keymap is a view of the repl" (REJECTED). The quest's rulings win over anything below.

# auth — URL deep-link into anima (terminal · mode · token)

Research only, tree read 10-19. All paths repo-rooted.

## 1 · lighthouse auth today

There is NO Identity / Authentication / Authority entity. Auth state is an embeddable on User:

```ts
// systems/runtime/entities/User.ts:5
export class AuthenticatorEmbedEntity {
  provider!: string;
  credentials: Record<string, any> & Opt = {};   // { username, password: argon2 }
  tokens: Record<string, string> & Opt = {};     // { access, refresh } — ONE slot each
}
// systems/runtime/entities/User.ts:25  byUsername = json_extract(authentication, '$.credentials.username')
// systems/runtime/entities/User.ts:60  authentication: { kind: "embedded", ..., hidden: true }
```

Tokens are HS256 JWTs signed with `lighthouse.secrets.jwt` (`systems/runtime/lighthouse/prototype.js:13`):

```js
// systems/runtime/lighthouse/signer.js:4
const ACCESS_TTL = "1d";
const REFRESH_TTL = "180d";
const OPERATOR_TTL = "2m";
// :18
    access: (user) => sign({ id: user.id, type: "access" }, ACCESS_TTL),
    refresh: (user) => sign({ id: user.id, type: "refresh" }, REFRESH_TTL),
    operator: () => sign({ type: "operator" }, OPERATOR_TTL),
// :36 refresh is stateful: JWT valid AND equal to the stored slot
export async function bearer({ secret, users }, refresh) {
  const payload = await signer(secret).verify(refresh, "refresh");
  ...
  return user?.authentication?.tokens?.refresh === refresh ? user : null;
}
// :43 access is stateless: JWT verify only, never compared to the slot -> not revocable for 1d
export function authenticate({ secret, users }) {
  ...
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : ctx.request.url.searchParams?.get("token");
```

Minting: `authority(ctx, user)` (`systems/runtime/lighthouse/apertures/users.js:16`) signs `{access, refresh}`; every entry route writes them into the ONE slot:

```js
// systems/runtime/lighthouse/apertures/users.js:26
    const tokens = await authority(ctx, user);
    wrap(user).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
```

Consequence: one live refresh per user. A second login (another device, ghost vs anima) overwrites the slot; the first client's next `/refresh` fails `bearer` (`signer.js:40`) -> `SESSION_EXPIRED` (`systems/anima/src/lighthouse.js:150`). Any minted-session design inherits this.

Routes on `/lighthouse/*` (`systems/runtime/lighthouse/lifecycle/population.js:9-12`, branched at `lifecycle/resolution.js:6`): `/metadata` (ungated, returns manifest incl. traits), `/login` `/password` (operator JWT) `/logout` `/verify` `/refresh` (`apertures/users.js:21-67`), plus trait grafts.

Traits (`systems/runtime/lighthouse/traits/`): only three exist, enum `["JOINABLE","INVITATIONAL","AUTOLOGIN"]` (`subsystems/typology/schematics/primitives/instance.js:59`). There is NO `OPEN` / `CLOSED` trait and no 403 path anywhere in the tree (grep).
- `JOINABLE` grafts `/signup` (`traits/joinable.js:6-23`).
- `AUTOLOGIN` grafts `/autologin` = mint authority for `trait.AUTOLOGIN.username`, no input (`traits/autologin.js:6-12`); finalizer creates that user at boot (`:14-24`). Every visitor is that user.
- `INVITATIONAL` = `export const INVITATIONAL = () => {};` (`traits/invitational.js:1`); schematic desc promises "/signup takes an invite token" (`instance.js:75`). Nothing implements it.

Client storage:
- anima: `localStorage["lighthouse:<url>"] = {authority, user}` (`systems/anima/src/lighthouse.js:8,203-234`) — readable by any script on the origin.
- anima has NO AUTOLOGIN client trait (grep `autologin` in `systems/anima/src`: zero).
- ghost: `<ledger scope>/credentials.json`, keyed by lighthouse origin, mode 0600 (`systems/ghost/entities/lighthouse/lifecycle/index.js:4,15-30`), validated by `Credential` schema (`subsystems/typology/schematics/primitives/credentials.js:5`). ghost's AUTOLOGIN finalizer: `lighthouse.isAuthorized || lighthouse.autologin()` (`systems/ghost/entities/lighthouse/traits/autologin.js:1`).

## 2 · the wire

- HTTP: `Deno.serve(..., shard.cors.wrap(shape.http(die.aperture)))` (`systems/runtime/runtime/lifecycle/integration.js:32-35`). Client sets `Authorization: Bearer <access>` per request (`subsystems/typology/gestalten/shard/connection.js:3-9`).
- WebSocket `/multiplex` (`integration.js:31`, `subsystems/typology/gestalten/shard/serve.js:45-58`). The access token ALREADY rides the WS URL query:

```js
// subsystems/typology/gestalten/shard/transmitter.js:32
        const token = authority?.get()?.access;
        const base = new Url(origin).branch(mount);
        const armed = token ? base.with({ token }) : base;
// subsystems/typology/gestalten/shard/serve.js:49
      bearer: ctx?.request?.url?.searchParams?.get("token") ?? null,
// subsystems/typology/prototypes/socket.js:166  per-frame: packet.token ?? this.bearer -> synthetic authorization header
```

  (browsers cannot set headers on `new WebSocket`, so query is the usual workaround; it lands in server/proxy logs, not browser history.)
- Gates: `/userspace/*` `.use(lighthouse.authenticate).use(lighthouse.bind)` (`integration.js:49`); runtime aperture same (`runtime/lifecycle/resolution.js:30`); daemon (`systems/runtime/daemon/lifecycle/resolution.js:5`). `bind` = datamap filter `{user: ctx.user.id}` (`lighthouse/lifecycle/population.js:8`).
- CORS: allow-list `localhost(:port)`, `127.0.0.1`, `*.vivalence.com` with credentials (`subsystems/typology/gestalten/shard/cors.js:1-23`).
- Failure: `authenticate` answers 401 `MISSING_TOKEN|INVALID_TOKEN|USER_NOT_FOUND` (`signer.js:8-11,48-52`).

## 3 · addressing terminal and mode

- Ids are uuid v7 (`subsystems/typology/entities/base/DataEntity.ts:164`) — time-ordered, guessable-ish, NOT secrets. Safety comes from scope, not obscurity.
- Terminal: `user` m:1, `daemon`, `thread`, `index` (`systems/runtime/entities/Terminal.ts:13-20`); default-on filter `{user: args.user}` (`:28-33`); route scoped `own` (`integration.js:52`). A foreign terminal id under another user's token resolves to nothing. => a URL may name a terminal id safely.
- Stable: yes, persisted row; anima already remembers it as `bridge.layout.terminal` (`systems/anima/src/bridge/prototype.js:75`) and seats it: `terminals.settle(bridge.layout.terminal)` (`systems/anima/src/app/+layout.svelte:74`). `settle` no-ops if something is already active (`entities/terminal/terminals.js:28-33`).
- Mode: Mode row unique on `(daemon, type, slug)` (`systems/runtime/mode/Mode.ts:48-49,77`) — a mode slug alone is ambiguous across daemons; a URL needs `daemon` + `type/slug` (or the mode id).
- A terminal does not hold a mode; it holds a thread, the thread holds the mode (`Thread.ts:34`). "Land in mode X" = seat a thread of mode X: `mint(terminals, daemon, mode)` → `daemon.entities.thread.create({ mode: mode.id })` → `terminal.seat(thread)` (`systems/anima/src/app/panels/c/cards/threads.js:13-17`).
- `daemon.modes.<type>.<slug>` is the server-side lookup surface (codestyle "Mask keys are SEMANTIC, lookup surfaces LEXICAL").

## 4 · existing one-time / invite mechanisms

- None. Closest precedent: the operator token — a 2-minute typed JWT (`signer.js:6,20`) consumed by `/password` (`apertures/users.js:31-33`). It is short-lived but NOT single-use.
- INVITATIONAL: empty (`traits/invitational.js:1`); owed per `.ikiro/quests/frontier.md:19`; m94 table `.ikiro/quests/m94-trait-rejiggle.org:268` "none today; no ledger declares it".
- known issue `autologin-signin-flashes` (`.ikiro/known-issues.org:168-184`): ghost surface mounts `signin` one frame before the AUTOLOGIN finalizer authorizes, because the surface beat runs before the lighthouse lifecycle. Cosmetic; two shapes offered (hide signin while `implements("AUTOLOGIN")`, or reorder). Same flash will hit an anima URL-redeem unless the gate reads a "REDEEMING" status before `signin` (`systems/anima/src/app/gate.js:1-7` shows `signin` whenever `!authorized`).

## 5 · precedent

| system | URL carries | after | TTL | single-use |
|---|---|---|---|---|
| Jupyter | `?token=` (server secret) | sets cookie | server lifetime | no |
| VS Code `serve-web` | `?tkn=` connection token | cookie `vscode-tkn`, redirect strips | server lifetime | no |
| code-server | nothing (password form) | cookie | session | — |
| Grafana | off by default (`auth.jwt url_login`) | cookie | JWT exp | no |
| OAuth code + PKCE | `?code=` | POST /token | ≤10 min (RFC 6749 §4.1.2) | yes |
| magic link (Slack, Notion, Supabase) | one-time code | session cookie | 10–60 min | yes |

Risks of a secret in a URL: browser history + sync, Referer to outbound links (anima has `rel="noreferrer"` only on artifact links, `Turn.svelte:120`), server/proxy access logs, screenshots, shell history, chat pastes. RFC 6750 §5.3: don't pass bearer tokens in page URLs.
Mitigations: one-time exchange code, TTL ≤ 2–5 min, POST to redeem, strip with `history.replaceState`, put the code in the FRAGMENT (`#code=`, never sent to server or in Referer), `Referrer-Policy: no-referrer`, bind code to user (+ optionally terminal).

## 6 · two designs

### A — raw authority in the URL

```js
// systems/anima/src/lighthouse.js  (inside hydrate, before localStorage read)
const url = new URL(location.href);
const handed = new URLSearchParams(url.hash.slice(1)).get("refresh");
if (handed) {
  lighthouse.$authority.set({ refresh: handed });
  url.hash = "";
  history.replaceState(null, "", url);
}
// boot -> verify sees no access -> refresh() mints access (lighthouse.js:94-171)
```
Cost: 0 server lines; a 180-day reusable secret sits in history/screenshots, and it IS the user's single refresh slot — leak = full account until next login.

### B — lighthouse mints a one-time code, anima redeems it

Server: repository verbs on UserRepository (mikro-first), route grafted by INVITATIONAL (or its own trait).

```ts
// systems/runtime/entities/User.ts  (UserRepository)
async admit(user, ttl = 120_000) {
  const code = crypto.randomUUID();
  wrap(user).assign({ authentication: { tokens: { admission: code, admitted: Date.now() + ttl } } }, { merge: true, mergeObjectProperties: true });
  await this.em.flush();
  return code;
}
async redeem(code) {
  const user = await this.em.createQueryBuilder(this.entityName, "u")
    .where(`json_extract(u.authentication, '$.tokens.admission') = ?`, [code]).getSingleResult();
  if (!user || user.authentication.tokens.admitted < Date.now()) return null;
  wrap(user).assign({ authentication: { tokens: { admission: null, admitted: null } } }, { merge: true, mergeObjectProperties: true });
  return user;
}
```
```js
// systems/runtime/lighthouse/traits/invitational.js
export const admission = new Vector()
  .open("/admit", [lighthouse.authenticate], async (input, ctx) => respond.success({ code: await ctx.lighthouse.users.admit(ctx.user) }))
  .open("/redeem", async ({ code }, ctx) => {
    const user = await ctx.lighthouse.users.redeem(code);
    if (!user) return respond.error(ctx, "INVALID_CODE", "Unknown, used or expired code", 401);
    const tokens = await authority(ctx, user);
    wrap(user).assign({ authentication: { tokens } }, { merge: true, mergeObjectProperties: true });
    await ctx.lighthouse.users.em.flush();
    return respond.success({ authority: tokens, user: card(user) });
  });
export const INVITATIONAL = (lighthouse) => { lighthouse.aperture.graft(admission); };
```
(`/admit` gating shape is a sketch: today `authenticate` is a `.use` middleware, so it would be `new Vector().branch("/admit").use(authenticate)…` — exact graft per `apertures/users.js` idiom.)

Client: read once, strip, POST, then seat.

```js
// systems/anima/src/lighthouse.js  (new, called from +layout.svelte onMount before boot)
export async function admit(lighthouse, bridge) {
  const url = new URL(location.href);
  const code = new URLSearchParams(url.hash.slice(1)).get("code");
  const terminal = url.searchParams.get("terminal");
  url.hash = "";
  history.replaceState(null, "", url);
  if (terminal) bridge.layout.terminal = terminal;
  if (code) await lighthouse.enter("/lighthouse/redeem", { code });
}
```
Minter: ghost `viva` (already holds credentials, `credentials.json`) calls `/lighthouse/admit` and prints `http://localhost:1794/?terminal=<id>&mode=<daemon>/<type>/<slug>#code=<uuid>` — the `jupyter server list` shape.
Cost: ~30 lines server + ~10 client; code is 2-min, single-use, POSTed, in the fragment; still overwrites the user's refresh slot (kicks the minting ghost's session on its next refresh) unless tokens become per-session.

### the slot caveat (both designs)

`authority` + assign into `authentication.tokens` (`users.js:26-27`) = one session per user. B's `/redeem` minting a fresh pair logs the minting `viva` out on its next `/refresh`. Options: (a) accept (same as /login today), (b) `/redeem` returns the EXISTING refresh instead of a new one (shares the session, no kick), (c) per-session tokens — a real Session entity — over-engineering for now.

## open facts

- anima does not build (frontier:4) — nothing here is runnable-verified in a browser.
- `mode=` resolution needs a daemon: `daemon/type/slug` or mode id; landing = find-or-create thread of that mode and `terminal.seat(thread)` (`threads.js:13-17`).
