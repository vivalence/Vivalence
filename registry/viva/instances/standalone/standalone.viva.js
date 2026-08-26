import paladin from "@vivalence/paladin";
import { App, Url, Vector, svelte, v } from "@vivalence/typology";
import { EntitySchema, types } from "@mikro-orm/core";
import { DataEntity, DataRepository, DataSchema, LiteralEntity } from "@vivalence/runtime";

export const manifest = { type: "instance", slug: "standalone", version: "0.0.1" };

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
      "m39 demo — a whole flashcard app declared in the instance file: dataset-seeded literals and symbols, review memory in a dedicated Retention entity, a coach that loads the deck and records reviews.",
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
