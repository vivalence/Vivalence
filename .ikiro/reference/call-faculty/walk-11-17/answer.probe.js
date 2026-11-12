import { fromm, Pool, v } from "@vivalence/typology";
import { Yield as Minted } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/prototypes/pool.js";

const ROOT = "/Users/finn/vivalence/code/vivalence/";
const read = async (path) => JSON.parse(await Deno.readTextFile(ROOT + path));
const { Turn } = v.primitives.hallucination;
const reads = (held) => { const yielded = fromm.yield(held); return JSON.stringify({ kind: yielded.kind, condition: yielded.condition, output: yielded.output }); };

console.log("=== Q28 · the pool's yield, today and without kind · ERROR · meta");
const buffer = { id: "b1" };
const today = Minted.NOMINAL([buffer]);
const bare = (buffers) => (buffers.length ? { condition: "NOMINAL", output: { buffer: buffers } } : { condition: "EXHAUSTED", output: { buffer: [] } });
console.log("today ", JSON.stringify(today), "· fromm reads", reads(today));
console.log("bare  ", JSON.stringify(bare([buffer])), "· fromm reads", reads(bare([buffer])));
console.log("drain today", JSON.stringify(await Pool.of(buffer).drain()), "· empty", JSON.stringify(await Pool.of().drain()));

const Meta = v.record(v.string(), v.unknown());
const Yield = v.object(
  {
    condition: v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]),
    output: v.record(v.string(), v.unknown()),
    meta: Meta.optional(),
  },
  { additionalProperties: false },
);
const Response = v.object(
  {
    condition: v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]),
    output: v.record(v.string(), v.unknown()),
    turns: v.array(Turn),
    meta: Meta,
  },
  { additionalProperties: false },
);
const verdict = (schema, held) => ([...schema.errors(held)].length ? "INVALID" : "valid");

const folded = (await read("subsystems/typology/tests/snapshots/hallucination-object-schema.snapshot.json")).folded;
const picture = { images: [{ type: "image", media: "image/png", data: "iVBORw0KGgo" }], usage: { prompt_tokens: 12, completion_tokens: 4160, total_tokens: 4172, cost: 0.04 } };
const choice = { same: { yes: 0.03, partly: 0.96, no: 0.01 }, grade: [0.01, 0.97, 0.02], ok: 0.97 };

console.log("=== today, against A's Yield");
for (const [name, held] of [["object", folded], ["picture", picture], ["choice", choice]]) console.log(name, verdict(Yield, held));

const A = {
  object: { condition: folded.condition, output: { ...folded.output, turn: folded.turns }, meta: folded.meta },
  picture: { condition: "NOMINAL", output: { image: picture.images }, meta: { usage: { input: 12, output: 4160, cost: 0.04 }, provider: { usage: picture.usage } } },
  choice: { condition: "NOMINAL", output: { object: choice } },
};
console.log("=== A · every render answers a Yield");
for (const [name, held] of Object.entries(A)) console.log(`--- ${name} · ${verdict(Yield, held)} · fromm reads ${reads(held)}\n${JSON.stringify(held, null, 2)}`);
const { open, ...answered } = folded;
console.log("=== B · only the folded answer gets a schematic; open: null dropped");
console.log("object", verdict(Response, answered), "· fromm reads", reads(answered));
console.log(JSON.stringify(answered, null, 2));
