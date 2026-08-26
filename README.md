<p align="center">
  <a href="#documentation">Docs</a> ·
  <a href="#installation">Install</a> ·
  <a href="#funding-p2p">Funding</a> ·
  <a href="#noticeboard">Notices</a> ·
  <a target="_blank" href="https://discord.gg/QyS9Xt9ht8">Discord</a>
</p>

<p align="center">
  <img src="systems/kajuit/static/videos/vid-viket-seldoncrisis-800x160p-12fps.gif" alt="VivalenceOS" width="100%" />
</p>

<p align="center">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/license-fair--source-2ea44f?style=flat-square" alt="License: Fair Source" /></a>
  <img src="https://img.shields.io/badge/status-early%20alpha-orange?style=flat-square" alt="Status: early alpha" />
  <img src="https://img.shields.io/badge/deno-2.7+-000000?style=flat-square&logo=deno" alt="Deno 2.7+" />
  <img src="https://img.shields.io/badge/svelte-5-FF3E00?style=flat-square&logo=svelte" alt="Svelte 5" />
  <img src="https://img.shields.io/badge/mikroorm-6.6-663399?style=flat-square" alt="MikroORM 6.6" />
  <a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://img.shields.io/badge/ko--fi-support-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white" alt="Ko-fi" /></a>
  <!-- <img src="https://img.shields.io/badge/typology-vivalence-1793D1?style=flat-square" alt="Vivalence Typology" /> -->
</p>

# ~ $home

Vivalence is like if WeChat, Emacs, and Hal9000 had a baby that's fair-source, deeply hackable, AI-harnessed as a first principle, and deployable in both single- and multiplayer.

## What is Vivalence and what is it for?

🧠 **Modal Apps and Runtimes** Vivalence is Emacs' modal architecture applied to servers, applications, knowledge-graphs, and AI - aka. "Everything is a Plugin". 

🧠 **Procedurally generated, agentic apps**, a hallucination harness for the common AI faculties and modalities.

👾 **Daemons and dataspaces** composed from trait-based modes ("pluggable mini-apps").

🏛️ **Coherent architecture** built from functional algebraic types. Simple, powerful, very hackable.

🪢 **The Ontology**, an (optional) symbolic entity system, powers the daemons and their modes.

🌐 **Runs anywhere**, across complex network topologies, from localhost singleplayer to distributed dockerized multiplayer.

🧩 **Bring your own {Service}**: AI providers, database solutions, authentication and user management, or attach any other service or API.

📦 **First-class package management**, with agentic CRUD over the registry filesystem. `:TODO:`

🤝 **Free for private use**, and available under a <a href="#pricing-b2b">flat license fee</a> for institutional and commercial use.

🎓 **The first killer app is a language learning system.** `:WIP:`

<!-- ## How did Vivalence come about and where is it at? -->

<!-- **Vivalence was started when GPT-3.5 came out**, to build the perfect operating system for "The Young Lady's Illustrated Primer" — and it turned out it had to be very good at everything else in order to become that. It is the kind of system that would power Isaac Asimov's Foundation. For more about the spiritual ancestry read <a target="_blank" href="https://crackedbeefcake.com/on/eva">on/eva</a>. -->


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

# Documentation

The architecture in four sentences:

You install "Modes" into "Daemons". Daemons are void knowledge and execution spaces, and Modes carry payloads that give your Daemons shape, behavior, face, and identity.

Modes can be, do, or look like anything that's programmatically possible.

The payloads are implemented in a Mode's traits, and so far there are about a dozen traits, covering everything from APIs and harness functionality to data transport and UI rendering.

Full docs are under construction at `./documentation` and <a target="_blank" href="https://docs.vivalence.org">docs.vivalence.org</a> and currently consist entirely of slop.

For now you have to find all the nitty-gritty details in the codebase.
How Vectors are declaratively dispatched monadic composers, and how the typology features a built-in library of compilers and controllers to work with them.
Or how Daemons and Modes use Vectors to run anything from APIs to CRUD, cron, and co.
Not to mention the internal ontological entity backend, or the symbolic and literal type system, or any of the other nerdy goodies.

## Hello, Mode!

Here is a little dummy Mode. It talks to an LLM, exposes one endpoint, and renders a Svelte view in ~50 lines.

`registry/dummy/mode.viva.js` — what it is:
```js
// `typology` — 
import { App, Vector, v } from "@vivalence/typology";

// `manifest` — 
export const manifest = {
  type: "demo",
  slug: "dummy",
  traits: ["APPLICATION", "HARNESSED", "EXPOSED", "STANDALONE"],
};

// `app` — 
export const app = new App("App.svelte", v.buffer({ data: {} }));

// `harness` — how the mode uses AI:
export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.context.system("You are a demo. Demonstrate yourself.");
  await next();
});

// `aperture` — the mode's API. Note `ctx.mode.harness.object.render` — the harness is callable on the mode:
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

## Installation

You need <a target="_blank" href="https://deno.com">Deno</a> 2.7+. Everything else the repo carries.

```sh
# 1 — deno
curl -fsSL https://deno.land/install.sh | sh      # or: brew install deno
deno --version

# 2 — repo + dependencies
git clone https://github.com/vivalence/vivalence.git
cd vivalence
deno task dependencies

# 3 — scaffold this machine's run surface (the ledger); the standard packages register at first boot
deno task ghost/run /ledger/init ./testament/ledger

# 4 — create the localhost variant into place
#     (or @viva/variant/standalone for the one-file demo above)
deno task ghost/run /variant/create @viva/variant/localhost ./testament/variant

# 5 — fill in your env
cd testament/variant && cp .env.example .env
$EDITOR .env            # set VIVA_*_MOUNT to your repo path + the five SECRET_* keys
cd ../..

# 6 — boot (two terminals, from the repo root)
deno task runtime/run
deno task kajuit/run

# 7 — create the first user (lighthouse gates login; no signup UI yet)
deno task ghost/run /variant/auth signup you changeme
```

The runtime comes up on `:2501`, the kajuit web client on `:1794`. Once step 7 creates a user, open http://localhost:1794 and log in with those credentials.

Every path argument above is optional — without them the ledger lives at `~/.viva`, variants land in `~/.viva/variants/<slug>`, and `VIVA_VARIANT_MOUNT` accepts the bare slug.

# Pricing (B2B)

Vivalence is free for private use. Institutional use requires a license — a flat fee of ~€12/$13/£10/¥2,000/90元 per person per month, with a 10/12 discount on yearly. SaaS, PaaS, and consulting services will follow in time.

Licenses are issued programmatically — <a target="_blank" href="https://vivalence.lemonsqueezy.com/checkout/buy/1716f8a4-2def-4373-b46a-d5447a7e3232">get one here →</a>.

# Funding (P2P)

I **also** accept private financial contributions, in one of two buckets: gas money and break money. Monthly patreonage is gas money — it funds further development. One-off tips are break money — for me to take a breather. After ~3 years of solo development, I could use some break money.

<a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" /></a>

For one-off gas funding there will be an Open-Collective and a Kickstarter in due course.
