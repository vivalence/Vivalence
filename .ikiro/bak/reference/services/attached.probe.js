import { stagger } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/index.js";
import * as stockfish from "/Users/finn/.viva/registry/chess/services/stockfish/stockfish.viva.js";

const closed = [];
const PROVIDER = (service, mask) => ({
  finalize: async () => {
    service.provider = await mask.provider(mask);
  },
  terminate: async () => {
    closed.push(service.slug);
    await service.provider.close();
  },
});

const mask = { ...stockfish, manifest: { ...stockfish.manifest, traits: ["PROVIDER", "ATTACHED"] }, statics: { binary: "stockfish" } };
const service = { slug: "stockfish", manifest: mask.manifest };
const die = { service, mask };

const traits = async (die, next) => {
  die.service.finalizers = await stagger(die.service, die.mask, { PROVIDER, ATTACHED: () => {} });
  for (const finalize of die.service.finalizers) await finalize();
  try {
    await next();
  } finally {
    for (const terminate of (die.service.terminators ?? []).reverse()) await terminate();
  }
};

await traits(die, async () => {
  const daemon = { providers: { engine: die.service.provider } };
  const mode = { providers: { ...daemon.providers } };
  console.log("running  one instance", daemon.providers.engine === mode.providers.engine, JSON.stringify(Object.keys(mode.providers.engine)));
});
console.log("stopped  closed", JSON.stringify(closed));
