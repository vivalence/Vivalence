import { Vector, shape, shard, sleep } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { topography } from "@vivalence/typology/scenarios";
import { LiteralEntity } from "@vivalence/runtime";
import { DATASET, DATASINK } from "../daemon/traits/index.js";

const HOME = "/tmp/m22-playground";

const say = (what) => console.log(`\n\x1b[1m━━ ${what}\x1b[0m`);
const tree = async (root, indent = "") => {
  const entries = [...Deno.readDirSync(root)].sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const entry of entries) {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      console.log(`${indent}${entry.name}/`);
      await tree(path, indent + "  ");
    } else {
      const bytes = (await Deno.stat(path)).size;
      const rows = entry.name.endsWith(".json")
        ? JSON.parse(await Deno.readTextFile(path)).length
        : null;
      console.log(`${indent}${entry.name}  ${bytes}b${rows === null ? "" : `  ${rows} rows`}`);
    }
  }
};

await Deno.remove(HOME, { recursive: true }).catch(() => {});
await Deno.mkdir(HOME, { recursive: true });

say("0 · the source corpus on disk (what a module AUTHORS)");
const authored = await topography.corpus();
for (const file of ["dataset/symbols/structural.js", "dataset/literals/words/noun.js"])
  await Deno.copyFile(`${authored.dirname}/${file}`, `${HOME}/${file.split("/").pop()}`).catch(() => {});
await tree(authored.dirname);

say("1 · the daemon — in-memory sqlite, real MikroORM");
const scenario = await datamap.seed();
const daemon = {
  entities: scenario.repos,
  datamap: { introspect: () => scenario.orm.getMetadata() },
  twitch: new Vector(),
};
daemon.entities.em = scenario.em;
daemon.twitch.branch("/after").use(shard.datamap.detached(scenario));
scenario.em.getEventManager().registerSubscriber(shape.subscriber(daemon.twitch));
console.log(`seeded: ${await scenario.repos.literal.count({})} literals, ${await scenario.repos.symbol.count({})} symbols (fixtures)`);

const mode = {
  type: "topography",
  slug: "playground",
  entity: { installed: false },
  module: { mount: authored, dataset: topography.dataset(), datasink: topography.datasink() },
};

say("2 · DATASET install — registry files ──▶ daemon entities (ANABOLIC)");
await DATASET(mode, daemon);
console.log(`after install: ${await scenario.repos.literal.count({})} literals, ${await scenario.repos.symbol.count({})} symbols`);
const minted = await scenario.repos.symbol.find({ slug: { $like: "word.lemma.%" } });
console.log(`minted by reference, declared in NO file: ${minted.map((row) => row.slug).join(", ")}`);

say("3 · DATASINK applied — twitch opened, armed = FALSE");
const { finalize: arm, terminate } = DATASINK(mode, daemon);
console.log(`sinks declared: ${mode.datasink.sinks.length}`);
for (const sink of mode.datasink.sinks)
  console.log(`  ${sink.type.padEnd(8)} where=${JSON.stringify(sink.where).slice(0, 58).padEnd(60)} → ${sink.target.split ? `split(${sink.target.split}) ${sink.target.write}` : sink.target.write}`);

say("4 · drain({all:true}) — daemon entities ──▶ registry files (KATABOLIC)");
const first = await mode.datasink.drain({ all: true });
console.log(JSON.stringify(first, null, 2));

say("5 · what is on disk now (mount.dirname + each sink's target)");
console.log(`mount: ${authored.dirname}\n`);
await tree(authored.dirname);

say("6 · one emitted file, verbatim — dataset/symbols/lemmas.json");
console.log(await Deno.readTextFile(`${authored.dirname}/dataset/symbols/lemmas.json`));

say("7 · the fixpoint — drain again over unchanged state");
const second = await mode.datasink.drain({ all: true });
console.log(`written: ${second.written}   ← 0 means file = fn(DB)`);

say("8 · arm, then write ONE literal and watch the twitch mark ONLY literal dirty");
arm();
const nuovo = scenario.em.create(LiteralEntity, {
  slug: "nuovo.adjective",
  traits: ["TRANSLATED"],
  trait: { TRANSLATED: { known: "new", learning: "nuovo" } },
  symbol: {},
});
await scenario.em.flush();
nuovo.symbols.add(await scenario.repos.symbol.findOne({ slug: "word" }));
nuovo.symbols.add(await scenario.repos.symbol.findOne({ slug: "word.part-of-speech.noun" }));
await scenario.em.flush();
await sleep.ms(20);
console.log("literal written → /after/literal/create fired → dirty = { literal }");

say("9 · incremental drain — only the DIRTY type, not everything");
const third = await mode.datasink.drain({});
console.log(JSON.stringify(third, null, 2));

say("10 · noun.json rewritten WHOLESALE — the new row folded in");
console.log(await Deno.readTextFile(`${authored.dirname}/dataset/literals/words/noun.json`));
console.log(`\nlemmas.json now:`);
const lemmas = JSON.parse(await Deno.readTextFile(`${authored.dirname}/dataset/symbols/lemmas.json`));
console.log(lemmas.map((row) => `  ${row.slug}  ← ${row.literals.map((r) => r.slug).join(", ") || "(no literals)"}`).join("\n"));

say("11 · teardown — the terminator kills the pending settle");
console.log("terminate() cancels the debounce; without it the timer wakes into a dead connection");
terminate();
await sleep.ms(1600);

say("DONE — poke at it yourself");
console.log(`the mount is still here: ${authored.dirname}`);
await scenario.orm.close();
