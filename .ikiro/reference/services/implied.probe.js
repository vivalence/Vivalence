import { RULES, probe } from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/prototypes/integrity.js";

const IMPLIED = { service: ["PROVIDER"], datamap: ["PROVIDER"], hallucinator: ["PROVIDER"] };
const traits = (module) => module.manifest.traits ?? [];
const implied = [
  (module) => module.manifest.type in IMPLIED,
  (module) => ({
    ...module,
    manifest: { ...module.manifest, traits: [...new Set([...traits(module), ...IMPLIED[module.manifest.type]])] },
  }),
];
const span = () => {
  const faults = [];
  return { faults, fault: (error) => faults.push(error.message) };
};
const run = (label, rules, module) => {
  const held = span();
  const out = probe(rules)(module, held);
  console.log(label, JSON.stringify({ traits: out.manifest.traits, faults: held.faults }));
};
const WITH = [...RULES.slice(0, 2), implied, ...RULES.slice(2)];
const NO44 = WITH.filter((rule) => rule !== RULES.at(-1));
const stockfish = { manifest: { type: "service", slug: "stockfish", traits: [] }, provider() {} };
const mute = { manifest: { type: "service", slug: "mute", traits: [] } };
const libsql = { manifest: { type: "datamap", slug: "libsql" }, provider() {} };
run("today     stockfish", RULES, stockfish);
run("today     mute     ", RULES, mute);
run("implied   stockfish", WITH, stockfish);
run("implied-44 stockfish", NO44, stockfish);
run("implied-44 mute     ", NO44, mute);
run("implied-44 libsql   ", NO44, libsql);
