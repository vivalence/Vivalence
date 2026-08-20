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

## Hello, Variant!

A Mode is one citizen. A **Variant** is the whole recipe — runtime, daemons, services, client. `@viva/variant/standalone` is the shortest complete thing Vivalence can be: one file that declares a persisted entity, a domain, a mode with a face and an LLM coach, the machine that boots them, and some placeholder data.

Read it top to bottom — the four section comments are the whole tour:

- **retention** — an entity declared beside its schema. The dataspace grows a persisted type with no migration to author.
- **flashcard** — ONE Vector (`deck`) mounted twice: `tools: deck` is what the coach can call, `aperture: deck` is what the view can call. Same declaration, two folds.
- **the machine** — a runtime, one daemon whose `kernel` IS the two modules above, a lighthouse service, and the kajuit client.

`registry/viva/variant/standalone/standalone.viva.js` — the a whole application in one file:

```js
import paladin from "@vivalence/paladin";
import { App, Url, Vector, svelte, v } from "@vivalence/typology";
import { EntitySchema, types } from "@mikro-orm/core";
import { DataEntity, DataRepository, DataSchema, LiteralEntity } from "@vivalence/runtime";

export const manifest = { type: "variant", slug: "standalone", version: "0.0.1" };

// ── retention · the review-memory entity, whole declaration in one place ─────

class RetentionEntity extends DataEntity {
  literal;
  streak = 0;
  seen = 0;
  lastSignal = "";
}
const RetentionSchema = new EntitySchema({
  class: RetentionEntity,
  extends: DataSchema,
  name: "Retention",
  tableName: "Retention",
  uniques: [{ properties: ["literal"] }],
  repository: () => DataRepository,
  properties: {
    literal: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "literal",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    streak: { type: types.integer },
    seen: { type: types.integer },
    lastSignal: { type: types.string, nullable: true },
  },
});

const domain = {
  manifest: { type: "domain", slug: "recall", version: "0.0.1", traits: [] },
  entities: {
    retention: {
      type: "retention",
      entity: RetentionEntity,
      schema: RetentionSchema,
      repository: DataRepository,
    },
  },
};

// ── flashcard · deck + review over the Retention entity ──────────────────────

// ONE vector — the coach's tools AND the app's aperture (mode.call) are the same two natures.
const deck = new Vector()
  .open(
    {
      nature: "/load",
      valence:
        "Load the deck — every literal with its symbols and its retention (the dedicated review-memory entity; zeros when the literal was never reviewed).",
    },
    async (ctx) => {
      const literals = await ctx.daemon.entities.literal.find({}, { populate: ["symbols"] });
      const retentions = await ctx.daemon.entities.retention.find({}, { populate: ["literal"] });
      const kept = new Map(retentions.map((row) => [row.literal.slug, row]));
      return {
        condition: "OK",
        output: literals.map((literal) => {
          const row = kept.get(literal.slug);
          return {
            slug: literal.slug,
            trait: literal.trait,
            symbols: literal.symbols.getItems().map((symbol) => symbol.slug),
            retention: {
              streak: row?.streak ?? 0,
              seen: row?.seen ?? 0,
              lastSignal: row?.lastSignal ?? null,
            },
          };
        }),
      };
    },
  )
  .open(
    {
      nature: "/review",
      valence:
        "Record one review — upserts the literal's Retention row: seen always bumps, streak climbs when remembered and resets when forgotten.",
      input: v.object({
        literal: v.string().desc("The literal's slug, e.g. ciao."),
        remembered: v.boolean().desc("Did the learner produce it?"),
      }),
    },
    async (ctx) => {
      const literal = await ctx.daemon.entities.literal.findOne({ slug: ctx.input.literal });
      if (!literal)
        return { condition: "ERROR", output: { message: `no literal '${ctx.input.literal}'` } };
      const row =
        (await ctx.daemon.entities.retention.findOne({ literal: literal.id })) ??
        ctx.daemon.entities.retention.create({ literal, streak: 0, seen: 0 });
      row.seen += 1;
      row.streak = ctx.input.remembered ? row.streak + 1 : 0;
      row.lastSignal = ctx.input.remembered ? "SUCCESS" : "FAILURE";
      await ctx.daemon.entities.em.flush();
      return {
        condition: "OK",
        output: {
          literal: literal.slug,
          streak: row.streak,
          seen: row.seen,
          lastSignal: row.lastSignal,
        },
      };
    },
  );

const flashcard = {
  manifest: {
    type: "playground",
    slug: "flashcard",
    name: "Flashcard",
    description:
      "m39 demo — a whole flashcard app declared in the variant file: dataset-seeded literals and symbols, review memory in a dedicated Retention entity, a coach that loads the deck and records reviews.",
    version: "0.0.1",
    traits: ["APPLICATION", "STANDALONE", "DATASET", "TOOLED", "HARNESSED", "EXPOSED"],
  },
  app: new App(
    svelte`
      <script>
        let { buffer } = $props();

        let deck = $state([]);
        let flipped = $state(false);

        async function refresh() {
          const result = await buffer.mode.call.load();
          deck = result.output ?? [];
        }
        refresh();

        let card = $derived([...deck].sort((a, b) => a.retention.streak - b.retention.streak)[0]);

        async function verdict(remembered) {
          await buffer.mode.call.review({ literal: card.slug, remembered });
          flipped = false;
          await refresh();
        }
      </script>

      <div class="flashcard">
        <p class="deck">{deck.length} literals · retention is its own entity — reload keeps the memory</p>

        {#if card}
          <button class="card" onclick={() => (flipped = !flipped)}>
            {#if flipped}
              <span class="text">{card.trait.TRANSLATED.learning}</span>
              <span class="hint">{card.symbols[0]}</span>
            {:else}
              <span class="text">{card.trait.TRANSLATED.known}</span>
              <span class="hint">tap to flip</span>
            {/if}
          </button>

          {#if flipped}
            <div class="verdict">
              <button onclick={() => verdict(false)}>forgot</button>
              <button onclick={() => verdict(true)}>knew it</button>
            </div>
          {/if}
        {/if}

        <ul class="memory">
          {#each deck as literal (literal.slug)}
            <li>
              {literal.trait.TRANSLATED.learning} → {literal.trait.TRANSLATED.known}
              · streak {literal.retention.streak}
              · seen {literal.retention.seen}
            </li>
          {/each}
        </ul>
      </div>

      <style>
        .flashcard { height: 100%; display: grid; place-content: center; gap: 1rem; text-align: center; font-family: var(--font-family-code); }
        .card { display: grid; gap: 0.4rem; padding: 2rem 3rem; cursor: pointer; }
        .text { font-size: var(--font-size-4xl); }
        .hint { opacity: 0.4; font-size: var(--font-size-sm); }
        .verdict { display: flex; gap: 0.6rem; justify-content: center; }
        .memory { list-style: none; opacity: 0.55; font-size: var(--font-size-sm); display: grid; gap: 0.2rem; }
      </style>
    `,
    v.buffer({ data: {} }),
  ),
  harness: new Vector().use(async (ctx, next) => {
    ctx.hallucination.system.flashcard = [
      "You are the Flashcard coach — a two-card italian deck seeded by the mode's dataset.",
      "Load the deck with the load tool; when the learner reports a review, record it with the review tool — it evolves the literal's Retention entity.",
      "Keep replies to a sentence or two, plain text.",
    ].join("\n");
    await next();
  }),
  dataset: {
    entities: {
      symbol: [
        {
          slug: "word.part-of-speech.interjection",
          traits: ["ONTOLOGICAL", "LABELED"],
          trait: {
            ONTOLOGICAL: {},
            LABELED: {
              name: "Interjection",
              description: "A word expressing spontaneous feeling — a greeting.",
            },
          },
        },
        {
          slug: "word.part-of-speech.noun",
          traits: ["ONTOLOGICAL", "LABELED"],
          trait: {
            ONTOLOGICAL: {},
            LABELED: { name: "Noun", description: "A word naming a thing." },
          },
        },
      ],
      literal: [
        {
          slug: "ciao",
          traits: [],
          trait: { TRANSLATED: { known: "hello", learning: "ciao" }, RANKED: { rank: 1 } },
          symbols: [{ slug: "word.part-of-speech.interjection" }],
        },
        {
          slug: "mondo",
          traits: [],
          trait: { TRANSLATED: { known: "world", learning: "mondo" }, RANKED: { rank: 2 } },
          symbols: [{ slug: "word.part-of-speech.noun" }],
        },
      ],
    },
  },
  tools: deck,
  aperture: deck,
};

// ── the machine ──────────────────────────────────────────────────────────────

export const runtime = {
  slug: "standalone-runtime",
  statics: { serve: () => new Url(paladin.env.get("VIVA_RUNTIME_SERVE")) },
  datamap: {
    module: "@viva/datamap/libsql",
    statics: { db: { file: `runtime.viva.db` } },
  },
};

export const daemons = [
  {
    manifest: { type: "daemon", slug: "standalone", version: "0.0.1" },
    docs: { name: "Standalone", valence: "the m39 one-file machine", icon: { emoji: "🃏" } },
    statics: {},
    kernel: [domain, flashcard],
    lighthouse: {
      module: "@viva/lighthouse/multiplayer",
      statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
    },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `standalone.viva.db` } },
    },
    hallucinators: [
      {
        module: "@viva/hallucinator/anthropic",
        statics: {},
        secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
      },
    ],
    consume: {},
  },
];

export const services = [
  {
    slug: "multiplayer",
    module: "@viva/lighthouse/multiplayer",
    secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_JWT") },
    statics: { serve: () => new Url(paladin.env.get("VIVA_LIGHTHOUSE_SERVE")) },
    datamap: {
      module: "@viva/datamap/libsql",
      statics: { db: { file: `lighthouse.viva.db` } },
    },
  },
];

export const lighthouse = {
  statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
};

export const clients = {
  kajuit: {
    slug: "kajuit",
    traits: ["ATTACHED"],
    statics: {
      serve: () => new Url(paladin.env.get("VIVA_CLIENT_KAJUIT_SERVE")),
      lighthouse: {
        remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")),
      },
    },
  },
};
```

Run it:
```sh
deno task ghost/run /variant/clone @viva/variant/standalone ./testament/standalone
cd testament/standalone && cp .env.example .env && $EDITOR .env
deno task runtime/run     # then, in a second terminal:
deno task kajuit/run
```

The flashcard coach is `HARNESSED`, so it wants `SECRET_VIVA_ANTHROPIC_API_KEY`. The deck, the review
loop, and the Retention entity all work without one.


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

# 3 — scaffold this machine's run surface (the ledger) + mount the standard packages
deno task ghost/run /ledger/install ./testament/ledger

# 4 — clone the localhost variant into place
#     (or @viva/variant/standalone for the one-file demo above)
deno task ghost/run /variant/clone @viva/variant/localhost ./testament/variant

# 5 — fill in your env
cd testament/variant && cp .env.example .env
$EDITOR .env            # set VIVA_*_MOUNT to your repo path + the five SECRET_* keys
cd ../..

# 6 — boot (two terminals, from the repo root)
deno task runtime/run
deno task kajuit/run

# 7 — create the first user (lighthouse gates login; no signup UI yet)
deno task ghost/run /variant/lighthouse/auth/signup you changeme
```

The runtime comes up on `:2501`, the kajuit web client on `:1794`. Once step 7 creates a user, open http://localhost:1794 and log in with those credentials.

# Pricing (B2B)

Vivalence is free for private use. Institutional use requires a license — a flat fee of ~€12/$13/£10/¥2,000/90元 per person per month, with a 10/12 discount on yearly. SaaS, PaaS, and consulting services will follow in time.

Licenses are issued programmatically — <a target="_blank" href="https://vivalence.lemonsqueezy.com/checkout/buy/1716f8a4-2def-4373-b46a-d5447a7e3232">get one here →</a>.

# Funding (P2P)

I **also** accept private financial contributions, in one of two buckets: gas money and break money. Monthly patreonage is gas money — it funds further development. One-off tips are break money — for me to take a breather. After ~3 years of solo development, I could use some break money.

<a target="_blank" href="https://ko-fi.com/crackedbeefcake"><img src="https://ko-fi.com/img/githubbutton_sm.svg" alt="Support me on Ko-fi" /></a>

For one-off gas funding there will be an Open-Collective and a Kickstarter in due course.
