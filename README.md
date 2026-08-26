<p align="center"> <a target="_blank" href="https://docs.vivalence.org">Docs</a> · <a href="#building-blocks">Blocks</a> · <a href="#getting-started">Install</a> · <a href="#noticeboard">Notices</a> · <a href="#pricing-b2b">Pricing</a> · <a href="#funding-p2p">Funding</a> · <a target="_blank" href="https://discord.gg/QyS9Xt9ht8">Discord</a> </p> <p align="center"> <img src="systems/kajuit/static/videos/vid-viket-seldoncrisis-800x160p-12fps.gif" alt="VivalenceOS" width="100%" /> </p> <p align="center"> <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-fair--source-2ea44f?style=flat-square" alt="License: Fair Source" /></a> <img src="https://img.shields.io/badge/status-early%20alpha-orange?style=flat-square" alt="Status: early alpha" /> <img src="https://img.shields.io/badge/deno-2.7+-000000?style=flat-square&logo=deno" alt="Deno 2.7+" /> <img src="https://img.shields.io/badge/svelte-5-FF3E00?style=flat-square&logo=svelte" alt="Svelte 5" /> <img src="https://img.shields.io/badge/mikroorm-6.6-663399?style=flat-square" alt="MikroORM 6.6" /> <a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://img.shields.io/badge/ko--fi-support-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi" /></a> </p>

~ $home

Vivalence is a modal operating system and app platform. AI-harnessed as a first principle.

You compose systems instead of installing apps: modes are the building blocks (datasets, domain logic, services, interfaces - all properties of modes) and you compose them into daemons. Vivalence's modal architecture turns apps into evolving systems, capable of growing and changing to fit your needs when they arise.

Free for private use, <a href="#pricing-b2b">flat license fee</a> for institutional and commercial use. Fair Source.

## Modality
 
Your setup shouldn't have to be like anyone else's.
 
A mode is just JavaScript and Svelte — no magic.
 
Fork existing systems, hand-roll your own, or prompt one into existence on an architecture designed for it.
 
<!-- → **[awesome-vivalence](https://github.com/vivalence/awesome-vivalence)** — the curated (and growing) registry. PRs welcome. -->

## Quickstart
Five steps from zero to a running system.

For more depth, read the <a target="_blank" href="https://docs.vivalence.org">Slowstart</a>.

### 0 — Install

Everything runs through `viva`, an instance of the shell client `@vivalence/ghost`. 

```sh
curl -fsSL https://deno.land/install.sh | sh
git clone https://github.com/vivalence/vivalence.git
cd vivalence
deno task install
```

Deno 2.7+ is the only prerequisite; the repo carries everything else. `deno task install` fetches dependencies and links `viva` into `~/.deno/bin` — deno's installer already put that on your PATH; if deno is brand new, open a fresh shell once. The CLI remembers this repo via `$VIVA_REPOSITORY_MOUNT` in `~/.config/viva/env`. 

So, from here on you can run `viva` from anywhere.

### 1 — `viva ledger/init`

```sh
viva ledger/init
```

Creates the `ledger` — the one directory Vivalence owns on your machine (default `~/.viva`, the wizard lets you move it and persists `VIVA_LEDGER_MOUNT`). The ledger holds everything the system needs to remember: the record of tapped packages, the store remote packages clone into, the shelf created instances live on, plus locks, logs, and sessions.

It's machine state, not git-managed at top level. 

The doctor should tell you that:
```sh
viva ledger/doctor

scopes
✓ ledger         ~/.viva
✓ repository     ~/vivalence
✓ registry       ~/.viva/registry
✗ instance       —
```


### 2 — `viva registry/tap`

```sh
viva registry/tap <source: path | git url> [target: path]

viva registry/tap registry/viva
```

Adds a `package` to the registry. Packages are modes whose job is to carry other modes: datasets, domains, services, instance recipes. `tap` takes a local path or a git URL; local is recorded in place, remote is cloned into the ledger's store — or into an optional `[target]` if you'd rather keep it somewhere of your own. Either way the package is recorded and its modes can be used in daemons, referenced by owner/type/slug: `@viva/instance/hello-world`.

The registry should list it:
```sh
viva registry/list

packages
reference                  owner  modules  root
~/vivalence/registry/viva  @viva  11       ~/vivalence/registry/viva
```

### 3 — `viva instance/create`

```sh
viva instance/create @viva/instance/hello-world

# or as one: create it and bind it to this shell
viva instance/create @viva/instance/hello-world --use
```

An `instance` is one runnable system: a runtime, its daemons, its clients — declared in one directory. `create` copies the recipe out of the registry onto the ledgers instances (`~/.viva/instances/hello-world/`) or any custom path - recorded in `~/.viva/instances.json`. 

Ledger holds `~/.viva/instances/hello-world/`, and `viva instances/list` shows it. `--use` does step 4's `instances/use` for you, in the same call.

### 4 — `viva instance/init`

`instance/init` reads the declaration's `environment` schema, writes the `.env` with every default filled, then prompts for what is still owed — usually the secrets. 

```sh
viva instances/use hello-world     # pid level bind
viva instance/init                 # populates instance .env

# or as one: viva instances/use hello-world init
```
`instances/use` selects one instance out of the set for this shell. 

To signup new users, use `viva instance/auth signup <username> <password>`.

The instance's `.env` is now populated and the instance ran once.

### 5 — `viva instance/run`

the daily driver command to get an instance running is `instance/run`

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

Open **http://localhost:1794**, log in with the account from step 4, and you're inside: the kajuit client attaches to the daemons and renders their modes as buffers.

### 6 — Summary and next steps

- [x] `deno task install` — `viva` linked into `~/.deno/bin`, this checkout pinned in `~/.config/viva/env`
- [x] `ledger/init` — `~/.viva` exists: the one directory Vivalence owns on your machine
- [x] `registry/tap` — the `@viva` package recorded; its modes resolve by reference from any shell
- [x] `instance/create` — `hello-world` copied onto the shelf, yours to edit and version
- [x] `instance/init` — the instance's `.env` populated, your account registered against its lighthouse
- [x] `instance/run` — runtime serving on `:2501`, kajuit on `:1794`, and you're logged in

Continue here:
- the <a target="_blank" href="https://docs.vivalence.org/50.01_slowstart">Slowstart</a> — the same climb, with the machinery explained at every step


## Hello, Mode!

Here is a little dummy Mode. It talks to an LLM, exposes one endpoint, and renders a Svelte view in ~50 lines.

`registry/dummy/mode.viva.js` — what it is:
```js
import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "demo",
  slug: "dummy",
  traits: ["APPLICATION", "HARNESSED", "EXPOSED", "STANDALONE"],
};

export const app = new App("./App.svelte", v.buffer({ data: {} }));

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.context.system("You are a demo. Demonstrate yourself.");
  await next();
});

export const aperture = new Vector().open("/hello/world", async (ctx) => {
  const { object } = await ctx.mode.harness.object.render({
    turns: [{ role: "user", parts: [{ type: "text", text: "Say hello." }] }],
    output: v.object({ greeting: v.string() }),
  });
  return { greeting: object.greeting };
});
```

`registry/dummy/App.svelte` — what it is:
```svelte
<script>
  let { terminal, daemon, mode, thread, buffer } = $props();

  let greeting = $state("");

  const modes = terminal.daemon.entities.mode.$entities.get(); 

  async function demonstrate() {
    const result = await buffer.mode.connection.call("/hello/world");
    greeting = result.greeting;
  }
</script>

<h1>hello world</h1>
<button onclick={demonstrate}>demonstrate</button>
<p>{greeting}</p>
<ul>
  {#each modes as mode}
    <li>{mode.type}/{mode.slug}</li>
  {/each}
</ul>
```

## Noticeboard

- *Security Notice:* Vivalence is in early alpha and only just transitioning to build-in-public. It is considered insecure on a network level and should - for now - live inside a moat 🌊🏰.
- *Development Notice:* Vivalence is only just transitioning to build-in-public and is to be considered both *early* and *alpha*. Don't expect things to be working or documented. This release is for the curious. It's probably another year to stability and a decade to maturity and invisible effortlessness.
- *Funding Notice:* See <a href="#funding-p2p">#funding</a>; more funding -> more faster better.
- *Development Notice:* Docs are low priority right now. This release is for the curious. Use llms. Move and break things.
- *Community Notice:* <a target="_blank" href="https://discord.gg/QyS9Xt9ht8">Discord</a>.
- *Community Notice:* Email list 🔎 🗺️ 💎
- *Brand Notice:* <a target="_blank" href="https://www.youtube.com/watch?v=4Ia6MDbNJWI">Teaser</a>
- *Organizational Notice:* Vivalence splits in two. .org & .com. The .com is the engine, the .org is the estate. Commerce funds the commons.
- *License Notice:* The license aims to balance individual freedom of use and safety in contribution with the economic sustainability of the project — unrestricted private use, licensed institutional use. Fair Source.
- *Community Notice:* This is an ecosystem play. I intend to pay successful contributors permanently — core, registry, the dependencies this stands on, the infrastructure it runs on. More adoption -> more money for the ecosystem.
- *Contribution Notice:* AI slop is only accepted in — and in fact intended for — the registry. Contributions to the core get stickler-meeseeks'd line by line. Yappers, sloppers, and boneheads get blocked. Less is more.
- *Contribution Notice:* The architecture is — I suspect — extremely scalable and flexible in its application. I would LOVE to have some input and feedback on this.
- *Personal Notice:* Vivalence is meant to be yours. I neither can nor want to be responsible for you and your actions. The software is provided as is — fuck around and find out.

🐆 The cat is out of the bag. <a target="_blank" href="https://www.youtube.com/watch?v=lX-K63pVPTM">o/acc.</a>

# Pricing (B2B)

Vivalence is free for private use. Institutional use requires a license — a flat fee of ~€12/$13/£10/¥2,000/90元 per person per month, with a 10/12 discount on yearly. SaaS, PaaS, and consulting services will follow in time.

Licenses are issued programmatically — <a target="_blank" href="https://vivalence.lemonsqueezy.com/checkout/buy/1716f8a4-2def-4373-b46a-d5447a7e3232">get one here →</a>.

# Funding (P2P)

I **also** accept private financial contributions, in one of two buckets: gas money and break money. Monthly patreonage is gas money — it funds further development. One-off tips are break money — for me to take a breather. After ~3 years of solo development, I could use some break money.

<a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" /></a>

For one-off gas funding there will be an Open-Collective and a Kickstarter in due course.
