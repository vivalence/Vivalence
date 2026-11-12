import * as typology from "@vivalence/typology";
const { Context, fromm, is, v } = typology;

const walk = (held, path, found = []) => {
  for (const [key, value] of Object.entries(held)) {
    if (key === "Response") found.push(`${path}.${key}`);
    if (value && typeof value === "object" && !("~kind" in value) && path.split(".").length < 5) walk(value, `${path}.${key}`, found);
  }
  return found;
};
console.log("root barrel exports named Response:", Object.keys(typology).filter((key) => /response/i.test(key)).join(" · "));
console.log("typology.Response is a class:", typeof typology.Response, typology.Response.name, "· the fetch global is another:", typology.Response !== globalThis.Response);
console.log("schematics named Response today:", walk(v.primitives, "v.primitives").join(" · "));

const answer = {
  condition: "NOMINAL",
  turns: [{ role: "assistant", parts: [{ type: "text", text: "ciao means hello" }], meta: { state: "complete" } }],
  output: { message: "ciao means hello" },
  meta: { state: "complete", rounds: 1 },
};
const carrier = new typology.Response({ status: 200 });
const mine = Object.keys(carrier);
const theirs = Object.keys(answer);
console.log("the carrier's keys:", mine.join(" · "), "| the answer's keys:", theirs.join(" · "), "| shared:", JSON.stringify(mine.filter((key) => theirs.includes(key))));

const ctx = new Context({});
ctx.output = answer;
console.log("ctx.output === ctx.response.body:", ctx.output === ctx.response.body);
console.log("=== ctx.response.json once an effect answered\n" + JSON.stringify({ ...ctx.response.json, status: 200, ok: true }, null, 2));

console.log("the carrier read as a yield:", fromm.yield(carrier).kind, "· is.yieldish", is.yieldish(carrier), "| the answer read as a yield:", fromm.yield(answer).kind, "· is.yieldish", is.yieldish(answer));
console.log("the answer against track.Response:", JSON.stringify([...v.primitives.track.Response.errors(answer)].map((fault) => fault.message)));
console.log("the answer against Picture.Response:", JSON.stringify([...v.primitives.hallucination.Picture.Response.errors(answer)].map((fault) => fault.message)));
console.log("the answer against Packet.Response:", [...v.primitives.hallucination.Packet.Response.errors(answer)].length ? "INVALID" : "valid");
