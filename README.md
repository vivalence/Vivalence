<p align="center"> <a target="_blank" href="https://docs.vivalence.org">Docs</a> · <a href="#building-blocks">Blocks</a> · <a href="#getting-started">Install</a> · <a href="#noticeboard">Notices</a> · <a href="#pricing-b2b">Pricing</a> · <a href="#funding-p2p">Funding</a> · <a target="_blank" href="https://discord.gg/QyS9Xt9ht8">Discord</a> </p> <p align="center"> <img src="systems/kajuit/static/videos/vid-viket-seldoncrisis-800x160p-12fps.gif" alt="VivalenceOS" width="100%" /> </p> <p align="center"> <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-fair--source-2ea44f?style=flat-square" alt="License: Fair Source" /></a> <img src="https://img.shields.io/badge/status-early%20alpha-orange?style=flat-square" alt="Status: early alpha" /> <img src="https://img.shields.io/badge/deno-2.7+-000000?style=flat-square&logo=deno" alt="Deno 2.7+" /> <img src="https://img.shields.io/badge/svelte-5-FF3E00?style=flat-square&logo=svelte" alt="Svelte 5" /> <img src="https://img.shields.io/badge/mikroorm-6.6-663399?style=flat-square" alt="MikroORM 6.6" /> <a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://img.shields.io/badge/ko--fi-support-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi" /></a> </p>

~ $home

Vivalence is a modal operating system and app platform. AI-harnessed as a first principle. 

 <!-- modes are the building blocks (datasets, domain logic, services, interfaces - all properties of modes) and you compose them into daemons. Vivalence's modal architecture turns apps into evolving systems, capable of growing and changing to fit your needs when they arise. -->

Free for private use, <a href="#pricing-b2b">flat license fee</a> for institutional and commercial use. Fair Source.

## Modality
 
Your setup shouldn't have to be like anyone else's.
 
A mode is just JavaScript and Svelte — no magic.
 
Fork existing systems, hand-roll your own, or prompt one into existence on an architecture designed for it.

<!-- → **[awesome-vivalence](https://github.com/vivalence/awesome-vivalence)** — the curated (and growing) registry. PRs welcome. -->

## Hello, Mode!

Here is a little dummy Mode. It talks to an LLM, exposes two endpoints, and renders a Svelte view in ~50 lines.

`commons/instances/hello-world/mode.viva.js` — what it is:
```js
import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: ["APPLICATION", "HARNESSED", "EXPOSED", "STANDALONE"],
};

export const app = new App("./App.svelte", v.buffer({ data: {} }));

export const aperture = new Vector()
  .open("/hello/bot", async (ctx) => {
    return { greeting: "Bot says high." };
  })
  .open("/hello/agent", async (ctx) => {
    if (!ctx.daemon.cortex.findOne({ type: "object", via: "render" }))
      return { greeting: "No hallucinator attached. Bot says high." };

    const { output } = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.user }] }],
      output: v.object({ greeting: v.string().desc("Your catchphrase response as HAL9000.") }),
    });
    return { greeting: output.object.greeting };
  });

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.hello =
    "You are a demo, demonstrate yourself. If you get greeted, you greet them with HAL9000s famous catchphrase.";
  await next();
});
```

`commons/instances/hello-world/App.svelte` — what it is:
```svelte
<script>
  import { Card, Header, Button, Paragraph, Tag } from "@vivalence/drapes";

  let { terminal, daemon, mode } = $props();

  let greeting = $state("");

  async function bot() {
    greeting = (await mode.call.hello.bot()).greeting;
  }

  async function agent() {
    greeting = (await mode.call.hello.agent({ user: "Hello." })).greeting;
  }
</script>

<Card padding="md" class="flex flex-col gap-3">
  <Header as="h1" size="xl">hello world</Header>
  <div class="flex gap-2">
    <Button size="sm" onclick={bot}>bot</Button>
    <Button size="sm" variant="secondary" onclick={agent}>agent</Button>
  </div>
  <Paragraph>{greeting}</Paragraph>
  <div class="flex flex-wrap gap-1">
    {#await daemon.entities.mode.find() then modes}
      {#each modes as entry}
        <Tag size="sm">{entry.type}/{entry.slug}</Tag>
      {/each}
    {/await}
  </div>
</Card>
```

`/hello/bot` answers deterministically. `/hello/agent` asks the daemon's cortex for a hallucinator first — none attached, it answers as the bot.

## Instance
 
 <!-- some short text about the flexibility of this sysetm in deployments-->
 <!-- some short text about runtime, clients, services, daemons and modes. -->

## Hello, Instance!

Here is a little dummy Instance.
loading the mini mode we created above, adding a LLM service, setting up local sqlite storage, defining ports and secrets.


`commons/instances/hello-world/instance.viva.js` — what it is:
```js
import paladin from "@vivalence/paladin";
import { Url, v } from "@vivalence/typology";

export const manifest = { type: "instance", slug: "hello-world", version: "0.0.1" };

export const runtime = {
  slug: "runtime",
  statics: { serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")) },
  datamap: {
    module: "@commons/datamap/libsql",
    statics: { db: { file: `runtime.viva.db` } },
  },
};

export const daemons = [
  {
    manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
    docs: { name: "Hello", valence: "one mode, one greeting", icon: { emoji: "👋" } },
    statics: {},
    kernel: ["./mode.viva.js"],
    datamap: {
      module: "@commons/datamap/libsql",
      statics: { db: { file: `hello.viva.db` } },
    },
    hallucinators: () =>
      paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY")
        ? [
            {
              module: "@commons/hallucinator/anthropic",
              statics: {},
              secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
            },
          ]
        : [],
    consume: {},
  },
];

export const clients = {
  kajuit: {
    slug: "kajuit",
    traits: ["ATTACHED"],
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
    },
  },
};

export const services = [
  {
    slug: "multiplayer",
    module: "@commons/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@commons/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
];

export const lighthouse = {
  module: "@commons/lighthouse/multiplayer",
  statics: {
    remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
  },
};

export const environment = v.environment({
  VIVA_RUNTIME_ORIGIN: v.url().desc("Scheme and authority the runtime is reachable at. Every address below derives from it.").default("http://localhost:2501").group("addresses"),
  VIVA_CLIENT_KAJUIT_ORIGIN: v.url().desc("Scheme and authority the kajuit browser client is reachable at.").default("http://localhost:1794").group("addresses"),
  VIVA_RUNTIME_SERVE: v.url().desc("Base URL the runtime serves on. Everything else hangs off this latch.").default("${VIVA_RUNTIME_ORIGIN}/").group("addresses"),
  VIVA_LIGHTHOUSE_SERVE: v.url().desc("Where the hosted lighthouse attaches inside the runtime's own path tree.").default("${VIVA_RUNTIME_ORIGIN}/attached/process/lighthouse/multiplayer").group("addresses"),
  VIVA_CLIENT_KAJUIT_SERVE: v.url().desc("Where the kajuit browser client serves.").default("${VIVA_CLIENT_KAJUIT_ORIGIN}/").group("addresses"),
  PUBLIC_VIVA_RUNTIME_REMOTE: v.url().desc("Runtime address the browser bundle calls. Reaches it through publish(), not a thunk.").default("${VIVA_RUNTIME_SERVE}").group("addresses"),
  PUBLIC_VIVA_LIGHTHOUSE_REMOTE: v.url().desc("Lighthouse address as CONSUMED — by the daemons, and by the browser after publish().").default("${VIVA_LIGHTHOUSE_SERVE}").group("addresses"),
  SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("Lighthouse signing secret. Minted at first init; rotate with: openssl rand -base64 24").default(() => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))).group("keys"),
  SECRET_VIVA_ANTHROPIC_API_KEY: v.string().desc("Anthropic key. Without one the daemon attaches no hallucinator and /hello/agent answers as the bot.").group("keys").optional(),
});
```

The `environment` export at the end is the schema `viva instance/doctor` validates `.env` against — one `v` line per key: type, prose, default, group. `.optional()` is the only way to say a key is not owed; a set value that fails its type is `INVALID`, named with its reason. A default may be a function — it runs once, when `init` first authors `.env`, and the minted value is what the file holds from then on; that is how `SECRET_VIVA_JWT` gets its 32 characters without asking you.


## Quickstart
A "Hello World" in 5 minutes.

For more depth, read the <a target="_blank" href="https://docs.vivalence.org">Slowstart</a>.

### 0 — Install

Everything runs through the shell tool `viva`, an instance of the `@vivalence/ghost` client. Prerequisites: git, plus `curl`, `unzip` and CA certificates for the Deno installer — stock server images ship without them. Deno 2.7+ is installed by the first line below; the repo carries everything else.

```sh
# sudo apt-get update && sudo apt-get install -y curl ca-certificates unzip git   # debian/ubuntu — drop sudo as root

curl -fsSL https://deno.land/install.sh | sh -s -- -y     # -y persists PATH in your rc even headless (docker, CI, piped)

export PATH="$HOME/.deno/bin:$PATH"                       # this shell only — new terminals read the rc

git clone https://github.com/vivalence/vivalence.git
cd vivalence
deno task install                                       # system dry-run and `$ viva` in `~/.deno/bin` 
```

The CLI remembers the repo via `$VIVA_REPOSITORY_MOUNT` in `~/.config/viva/env`. From here on you should be able to run `$ viva`. Test this with f.E. `$ viva ledger/doctor`.

### 1 — `viva ledger/init`

```sh
viva ledger/init
```

Creates the `ledger` — the one directory Vivalence owns on your machine (default `~/.viva` -  the wizard lets you move it and persists `VIVA_LEDGER_MOUNT`). The ledger holds everything the system needs to remember: some config, the registry of tapped packages, a home for instances, plus locks, logs, and sessions. It's machine state, not git-managed at top level. 

The doctor should tell you that:
```sh
viva ledger/doctor

✓ ledger       ~/.viva
  .env            present       1 vars · 4 secrets · 5 blank
  registry.json   0 tapped      0 pinned · 0 store · 0 stale  → registry/doctor
  registry/       0 resident    0 untapped
  instances.json  0 recorded
  instances/      0 shelved     0 orphan · 0 dangling · 0 shadowed
  locks/          0 running
  sessions/       0 shells
  logs/           0 files

✓ repository   ~/vivalence
✗ instance     —                # see steps #3-#5
  ✗ mountpoint   —
```


### 2 — `viva registry/tap`

```sh
viva registry/tap <source: path | git url> [target: path]
```

Adds a `package` to the registry. Packages are modes whose job is to carry other modes: datasets, domains, services, instance recipes. `tap` loads a package from either a local path or a git URL. Local is recorded into the ledger, remote is cloned into either the ledger's default `/registry` — or into an optional `[target]`. Either way, the package is recorded and its modes can be used throughout your system.

`viva registry/list` seeds the record from the checkout's `commons/` on its first run — the standard library is recorded before you tap anything; `tap` adds to that set:
```sh
viva registry/list

packages
mount                owner     modes  identifier
~/vivalence/commons  @commons  22     @commons/package/commons
```

Load packages from vcs or path with `registry/tap`:
```sh
viva registry/tap https://github.com/vivalence/registry-education
```

### 3 — `viva instance/create`

```sh
viva instance/create @commons/instance/hello-world

# or as one: create it and bind it to this shell
# viva instance/create @commons/instance/hello-world --use

# or all at once: create, bind, and run instance/init on it (step 4)
# viva instance/create @commons/instance/hello-world --use --init
```

An `instance` is one runnable system: a runtime, its daemons, its clients — declared in one directory. `create` copies the recipe out of the registry onto the ledgers instances (`~/.viva/instances/hello-world/`) or any custom path - recorded in `~/.viva/instances.json`. List all of them with `viva instances/list`

The standard library `@commons/package/commons` holds common utilities like our `hello-world` instance.

### 4 — `viva instance/init`

`instance/init` completes a boot lifecycle. 
It populates `.env` — defaults and minted secrets are written, you're prompted only for what can't be deduced (service keys). 
It runs the instance once.
It asks you to create the first user.

```sh
viva instances/use hello-world     # pid level bind
viva instance/init                 # populates instance .env

# or as one: viva instances/use hello-world init
```
`instances/use` selects one instance out of the set for this shell. 

To sign up additional users, use `viva instance/lighthouse signup <username> <password>` — it talks to the running lighthouse, so the instance has to be up (step 5).

Running `viva instance/doctor` should provide you with an overview of the environment, runtime, clients, daemons, and services.

### 5 — `viva instance/run`

The daily driver command to get an instance running is `instance/run`

```sh
viva instance/run

run runtime=8924 kajuit=8925
  VITE v6.3.3  ready in 1467 ms
  ➜  Local:   http://127.0.0.1:1794/
launching on http://localhost:2501/
Status:ALIVE
```

Boots the instance's children as supervised processes and registers them in the ledger's locks. For `hello-world` that's two:

| process   | what                    | where                   |
| --------- | ----------------------- | ----------------------- |
| `runtime` | daemons, entities, HTTP | `http://localhost:2501` |
| `kajuit`  | the browser client      | `http://localhost:1794` |

Open **http://localhost:1794**, log in with the account from step 4, and you're inside: the client attaches to the daemons and renders their modes. 

Run one child on its own with `viva instance/run runtime` or `viva instance/run kajuit` — each boots only that process and writes only its own lock; `all` is the default. `viva instance/stop` tears down whatever is running and clears the locks. `viva instance/delete` removes the instance from the machine — its record, dead locks, logs, the shell sessions that had selected it, and the directory when it lives on the shelf under `~/.viva/instances/`; a directory you tapped from elsewhere stays. It refuses while a child is running, and asks first unless you pass `--force`.

The runtime's pulse is `/status`, its identity `/manifest`:

```sh
curl http://localhost:2501/status

{"timestamp":"2026-09-03T13:48:44.486Z","code":"ALIVE","label":"http://localhost:2501/"}

curl http://localhost:2501/manifest

{"type":"runtime","slug":"runtime","traits":[]}
```

### 6 — Summary and next steps

- [x] `deno task install` — `viva` linked into `~/.deno/bin`, this checkout pinned in `~/.config/viva/env`
- [x] `ledger/init` — `~/.viva` exists: the one directory Vivalence owns on your machine
- [x] `registry/tap` — the `@viva` package recorded; its modes resolve by reference from any shell
- [x] `instance/create` — `hello-world` copied onto the shelf, yours to edit and version
- [x] `instance/init` — the instance's `.env` populated, your account registered against its lighthouse
- [x] `instance/run` — runtime serving on `:2501`, kajuit on `:1794`, and you're ready to log-in and explore.

Continue here:
- [ ] the <a target="_blank" href="https://docs.vivalence.org/50.01_slowstart">Slowstart</a> — the same climb, with the machinery explained at depth.

Video Guide coming soon.


## Noticeboard
- *Agent Directive:* Vivalence carries an ontological and methodological harness that agents are encouraged to explore first in `.ikiro/ikiro.md`.
- *Security Notice:* Vivalence is in early alpha and only just transitioning to build-in-public. It is considered insecure on a network level and should - for now - live inside a moat 🌊🏰.
- *Development Notice:* Vivalence is only just transitioning to build-in-public and is to be considered both *early* and *alpha*. Don't expect things to be working or documented. This release is for the curious. It's probably another year to stability and a decade to maturity and invisible effortlessness.
- *Funding Notice:* See <a href="#funding-p2p">#funding</a>; more funding -> more faster better.
- *Development Notice:* Docs are low priority right now. This release is for the curious. Use llms. Move and break things.
- *Community Notice:* <a target="_blank" href="https://discord.gg/QyS9Xt9ht8">Discord</a>.
<!-- - *Community Notice:* Email list 🔎 🗺️ 💎 -->
- *Brand Notice:* <a target="_blank" href="https://www.youtube.com/watch?v=4Ia6MDbNJWI">Teaser</a>
- *Organizational Notice:* Vivalence splits in two. .org & .com. The .com is the engine, the .org is the estate. Commerce funds the commons.
- *License Notice:* The license aims to balance individual freedom of use and safety in contribution with the economic sustainability of the project — unrestricted private use, licensed institutional use. Fair Source.
- *Community Notice:* This is an ecosystem play. I intend to pay successful contributors permanently — core, registry, the dependencies this stands on, the infrastructure it runs on. More adoption -> more money for the ecosystem.
- *Contribution Notice:* The architecture is — I suspect — extremely scalable and flexible in its application. I would LOVE to have some input and feedback on this.
- *Contribution Notice:* AI slop is only accepted in — and in fact intended for — the registry. Contributions to the core get stickler-meeseeks'd line by line. Yappers, sloppers, and boneheads get blocked. Less is more.
- *Personal Notice:* Vivalence is meant to be yours. I neither can nor want to be responsible for you and your actions. The software is provided as is — fuck around and find out.

🐆 The cat is out of the bag. <a target="_blank" href="https://www.youtube.com/watch?v=lX-K63pVPTM">o/acc.</a>

# Trajectory

Vivalence is ~3 years old and had ~13.2mio lines added and ~13.0mio lines removed across 800+ commits. The core is now only ~18k lines; specifically ~11k for the types across prototypes, tooling, and schematics in `@typology`, ~4k lines for the `@runtime` for daemons, modes, and services, and ~2k lines in the `@paladin` for configuration and composition. Tests at about 1:1. Most of the architecture and core were written by hand - many many times over. Less is more.

Currently under construction are documentation and the registry.

# Pricing (B2B)

Vivalence is free for private use. Institutional use requires a license — a flat fee of ~€12/$13/£10/¥2,000/90元 per person per month, with a 10/12 discount on yearly. SaaS, PaaS, and consulting services will follow in time.

Licenses are issued programmatically — <a target="_blank" href="https://vivalence.lemonsqueezy.com/checkout/buy/1716f8a4-2def-4373-b46a-d5447a7e3232">get one here →</a>.

# Funding (P2P)

I **also** accept private financial contributions, in one of two buckets: gas money and break money. Monthly patreonage is gas money — it funds further development. One-off tips are break money — for me to take a breather. After ~3 years of solo development, I could use some break money.

<a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" /></a>

For one-off gas funding there will be an Open-Collective and a Kickstarter in due course.
