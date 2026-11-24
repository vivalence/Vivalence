import { v } from "@vivalence/typology";
import { Condition } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/prototypes/yield.js";

const { Turn } = v.primitives.hallucination;
const Response = v.object(
  {
    condition: Condition.desc('How the request ended. Example: "NOMINAL"'),
    product: v
      .record(v.string(), v.unknown())
      .desc('What the request made: message, object, entities by type. Example: { message: "ciao means hello" }'),
    turns: v.array(Turn).desc("The turns this request produced, in order."),
    meta: v.record(v.string(), v.unknown()).desc('Why and how it stopped. Example: { state: "complete", rounds: 1 }'),
  },
  { additionalProperties: false },
);
const answer = {
  condition: "NOMINAL",
  turns: [{ role: "assistant", parts: [{ type: "object", data: { verdict: "right", grade: 0.9 } }], meta: { state: "complete", usage: { input: 30, output: 12 } } }],
  product: { object: { verdict: "right", grade: 0.9 } },
  meta: { state: "complete", usage: { input: 30, output: 12 }, rounds: 1 },
};
const { output, ...stale } = { ...answer, output: answer.product };
console.log(JSON.stringify(answer, null, 2));
console.log("faults", JSON.stringify([...Response.errors(answer)].length), "· the old key faults", [...Response.errors({ ...stale, product: undefined, output })].length > 0);
