import { release } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/modes.js";
import * as stockfish from "/Users/finn/.viva/registry/chess/services/stockfish/stockfish.viva.js";
import * as reader from "/Users/finn/vivalence/code/vivalence/commons/services/reader/service.viva.js";
import * as nlp from "/Users/finn/vivalence/code/vivalence/commons/services/nlp/service.viva.js";

const citizens = {
  engine: { ...stockfish, statics: { binary: "stockfish" } },
  reader: { ...reader, statics: {} },
  nlp: { ...nlp, statics: { remote: "http://localhost:5555", language: "it" }, secrets: { key: "probe" } },
};

for (const [slug, citizen] of Object.entries(citizens)) {
  const held = await citizen.provider(citizen);
  console.log("shape ", slug.padEnd(7), typeof held, JSON.stringify(Object.keys(held)));
}

const closed = [];
const engine = await citizens.engine.provider(citizens.engine);
const close = engine.close;
engine.close = async () => {
  closed.push("engine");
  await close();
};

const providers = async (modeDie, next) => {
  modeDie.providers = { ...modeDie.providers };
  modeDie.mode.terminators = [];
  for (const [slug, citizen] of Object.entries(modeDie.mode.consume)) {
    modeDie.providers[slug] = await citizen.provider(citizen);
    if (modeDie.providers[slug].close) modeDie.mode.terminators.push(modeDie.providers[slug].close);
  }
  await next();
};

const mode = {
  consume: { engine: { provider: () => engine }, reader: citizens.reader, nlp: citizens.nlp },
  stdout: { stop() {} },
};
const modeDie = { mode, providers: {} };
await providers(modeDie, async () => {});
console.log("beat   providers", JSON.stringify(Object.keys(modeDie.providers)), "terminators", mode.terminators.length);
await release({ modes: { study: { analysis: mode } } });
console.log("release closed", JSON.stringify(closed));
