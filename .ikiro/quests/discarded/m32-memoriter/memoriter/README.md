# @memoriter

Anki rebuilt as one self-contained vivalence package, under its Latin name: memoriter, "from memory, by heart". A demonstration: the full vertical — domain, dataset, mode, daemon — in the smallest shape that is still complete, and the first package that carries its own domain out of tree.

## Anatomy

```
package.viva.js          the package declaration, owner @memoriter
domain/                  @memoriter/domain/srs — the kernel module
  entities/              Literal (card), Symbol, Retention, Trace, Buffer
  retention/sm2.js       the SM-2 scheduler as a retention driver
  aperture/              /pick/*, /review/literal, /preview/literal
  types.js               STATUS (the acquisition ladder) · SIGNAL (AGAIN HARD GOOD EASY)
dataset/                 @memoriter/topography/latin-core
  latin.viva.js          DATASET + FRAUGHT: seeds on daemon boot, serves freight
  entities/              219 words, 50 sentences, 242 symbols — rows authored in words.js / sentences.js / symbols.js
  freight/               10 voices (sentences), 10 pictures (nouns) — placeholders
mode/                    @memoriter/srs/memoriter — the one mode
  memoriter.viva.js      APPLICATION STANDALONE EMITTER EXPOSED HARNESSED CONVERSATIONAL TOOLED
  buffer/Memoriter.svelte  the tablet: flip, four grades with live SM-2 horizons
  harness.js + hal/      Magister, the persona
  tools/                 /review /grade /progress /add — the conversational loop
  aperture.js            /chat (harness render) and /stats
  emitter.js             /session — deals the daily queue as a buffer
  progress.js            the learner report both /stats and /progress speak
tests/sm2.test.js        the scheduler, proven
```

## The scheduler

SM-2 as Anki ships it: learning steps 1m and 10m, graduation at one day, easy graduation at four, ease starts 2.5 and floors at 1.3, HARD multiplies 1.2 and costs 0.15 ease, GOOD multiplies by ease, EASY adds a bonus and always beats GOOD, a lapse halves the interval, costs 0.2 ease and sends the card to relearning, maturity at 21 days. It implements the same driver contract as the education domain's bayesian driver — encode, evolve, assess, sql.strength — so either can occupy the slot. `preview` is its one extra: the four horizons the tablet prints on the grade buttons.

## The dataset

English to Latin, classical and ecclesiastical. Ten topics from Religio to Sermo, three genders, two levels, one lemma symbol per word. Sentences carry the lemma symbols of the vocabulary they contain — Amor omnia vincit links amor, omnis, vincere — so weak words can surface the sentences that hold them. Symbols follow the education vocabulary: `word` / `sentence` roots are TOPOGRAPHICAL (a literal's ontology derives from them), grammatical facets (`word.part-of-speech.*`, `word.gender.*`) are ONTOLOGICAL, groupings (`topic.*`, `level.*`) are STRUCTURAL. Freight assets are generated placeholders; drop real recordings and pictures over the same paths.

## Wiring

Registered like any out-of-tree package — tap the folder, declare the daemon, restart the runtime:

```sh
deno task ghost/run /ledger/tap <absolute path to this folder>
```

```js
// testament/variant/memoriter.js
import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";

export const memoriter = {
  manifest: { type: "daemon", slug: "memoriter", version: "0.1.0" },
  docs: { name: "Memoriter", valence: "", icon: { emoji: "" } },
  statics: {
    language: {
      known: { slug: "english", name: "English" },
      learning: { slug: "latin", name: "Latine" },
    },
  },
  kernel: ["@memoriter/domain/srs", "@memoriter/topography/latin-core", "@memoriter/srs/memoriter"],
  lighthouse: {
    module: "@viva/lighthouse/multiplayer",
    statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
  },
  datamap: { module: "@viva/datamap/libsql", statics: { db: { file: "memoriter.viva.db" } } },
  hallucinators: [
    {
      module: "@viva/hallucinator/anthropic",
      statics: {},
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
    },
  ],
};
```

Then add `memoriter` to `daemons` in the active variant (`testament/variant/test.viva.js`). The one imported registry module is the hallucinator, which powers the Magister's conversation; everything else the package carries.

## Known constraint

APPLICATION modes outside the repository need npm resolution: the svelte bundler walks up from the mode's directory, so either symlink `node_modules` into the package root or add the repository's `node_modules` to esbuild's `nodePaths` upstream. While the folder sits inside the repository tree the walk finds the repository's `node_modules` and the constraint does not bite.
