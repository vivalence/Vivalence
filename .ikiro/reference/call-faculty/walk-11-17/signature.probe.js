import { Controller, Span } from "@vivalence/typology";
import { transcribe } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/gestalten/belt/hallucinate.js";
const received = [];
const faculty = { type: "verbatim", via: { stream: async function* (...args) { received.push(args); } } };
const source = (async function* () {})();
const input = { source, settings: { language: "it" } };
const policy = { controller: new Controller({ stdout: new Span("probe") }) };
for await (const _ of transcribe(faculty, input, policy));
console.log("today:", received[0].length, "positionals →", JSON.stringify(received[0].map((arg) => arg === source ? "<source>" : arg)));
async function* after(faculty, input, policy) {
  yield* faculty.via.stream(input, { signal: policy.controller.abort.signal });
}
received.length = 0;
for await (const _ of after(faculty, input, policy));
const [request, options] = received[0];
console.log("Q1A:  ", received[0].length, "positionals →", JSON.stringify([{ ...request, source: "<source>" }, options]), "· signal is AbortSignal:", options.signal instanceof AbortSignal);
