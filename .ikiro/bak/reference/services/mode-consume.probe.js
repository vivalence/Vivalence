import { Mode, Path } from "@vivalence/typology";
import { Paladin } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/paladin/prototype.js";
import { FULL } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/gestalten/belt/index.js";
import { belt } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/paladin/lifecycle.js";
import { lifecycle } from "/Users/finn/vivalence/code/vivalence/systems/runtime/typology.js";

const MODULES = [
  { manifest: { owner: "@probe", type: "package", slug: "probe", version: "0.0.1" } },
  { manifest: { owner: "@probe", type: "study", slug: "analysis", version: "0.0.1", traits: [] } },
  { manifest: { owner: "@probe", type: "board", slug: "play", version: "0.0.1", traits: [] } },
  { manifest: { owner: "@probe", type: "service", slug: "stockfish", version: "0.0.1", traits: [] }, provider: (citizen) => ({ engine: citizen.statics.threads }) },
  { manifest: { owner: "@probe", type: "service", slug: "reader", version: "0.0.1", traits: ["TOOLING"] }, provider: () => ({ open: () => {} }), tools: "reader tools" },
];

const paladin = belt(new Paladin(), FULL);
paladin.scopes([["ledger", () => true, () => new Path("/fixtures/wire")]]);
const registry = paladin.ledger.registry;
for (const module of MODULES) registry.pensieve.register({ ...module, source: new Path(`/fixtures/wire/${module.manifest.slug}.viva.js`) });

const mask = {
  manifest: { type: "daemon", slug: "chess", version: "0.0.1" },
  hallucinators: [],
  consume: { engine: { module: "@probe/service/stockfish", statics: { threads: 2 } } },
  modes: [
    {
      module: "@probe/study/analysis",
      mountpoint: new Path("/m/analysis"),
      consume: {
        reader: { module: "@probe/service/reader" },
        engine: { module: "@probe/service/stockfish", statics: { threads: 8 } },
      },
    },
    { module: "@probe/board/play", mountpoint: new Path("/m/play") },
  ],
};

const today = await registry.wire(mask);
console.log("today   analysis.consume.reader.provider", typeof today.modes[0].consume.reader.provider);
console.log("today   play.consume", JSON.stringify(today.modes[1].consume));

const consumed = async (citizen) => ({
  ...citizen,
  consume: Object.fromEntries(
    await Promise.all(Object.entries(citizen.consume ?? {}).map(async ([slug, query]) => [slug, await registry.accio(query)])),
  ),
});
const register = { ...today, modes: await Promise.all(today.modes.map(consumed)) };
console.log("wired   analysis.consume.reader.provider", typeof register.modes[0].consume.reader.provider);
console.log("wired   play.consume", JSON.stringify(register.modes[1].consume));

const die = { register, daemon: { providers: {} } };
await lifecycle.daemon.population.providers(die, async () => {});

const providers = async (modeDie, next) => {
  modeDie.providers = { ...modeDie.providers };
  for (const [slug, citizen] of Object.entries(modeDie.mode.consume)) {
    modeDie.providers[slug] = await citizen.provider(citizen);
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) modeDie.providers[slug].tools = citizen.tools;
  }
  await next();
};

const [analysis, play] = register.modes.map((citizen) => ({ mode: new Mode(citizen), providers: die.daemon.providers }));
await providers(analysis, async () => {});
await providers(play, async () => {});

console.log("daemon   ", JSON.stringify(die.daemon.providers));
console.log("analysis ", JSON.stringify(analysis.providers));
console.log("play     ", JSON.stringify(play.providers));
console.log("play shares the daemon's engine", play.providers.engine === die.daemon.providers.engine);
