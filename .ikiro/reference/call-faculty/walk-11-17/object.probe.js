import { fromm, soma } from "@vivalence/typology";

const data = { verdict: "right", grade: 0.9 };
const today = { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
const { object, ...after } = today;
const fold = (turn) => [...soma.drain(turn), { event: "/response/close", meta: { state: "complete", rounds: 1 } }].reduce(soma.transcript, null).output;
console.log("today · the fold's bag", JSON.stringify(fold(today)), "· fromm.yield", JSON.stringify(fromm.yield(today).output));
console.log("after · the fold's bag", JSON.stringify(fold(after)), "· fromm.yield", JSON.stringify(fromm.yield(after).output));
console.log("=== the turn after\n" + JSON.stringify(after, null, 2));
