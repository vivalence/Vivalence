// limit: 2000 chars
// run from the repo root:
// deno run -A --no-check --config deno.jsonc .ikiro/reference/ocr/verbatim.probe.js .ikiro/reference/ocr/two-column.tsv
import { v, verbatim } from "@vivalence/typology";

const { Verbatim } = v.primitives.hallucination;
const cells = (await Deno.readTextFile(Deno.args[0])).trim().split("\n").slice(1).map((held) => held.split("\t"));
const words = cells.filter((held) => held[0] === "5");
const blocks = [...new Set(words.map((held) => held[2]))];

const events = blocks.map((block) => {
  const held = words.filter((word) => word[2] === block);
  return {
    event: "/verbatim/final",
    transcript: held.map((word) => word[11]).join(" "),
    segment: Number(block),
    words: held.map((word) => ({
      word: word[11],
      confidence: Math.round(Number(word[10])) / 100,
      page: Number(word[1]),
      box: [Number(word[6]), Number(word[7]), Number(word[8]), Number(word[9])],
    })),
  };
});

for (const event of events) console.log("Verbatim.Final errors:", [...Verbatim.Final.errors(event)].length);
const state = events.reduce(verbatim.fold, verbatim.empty);
console.log("transcript:", JSON.stringify(verbatim.transcript(state)));
console.log(JSON.stringify({ ...state, settled: state.settled.map((entry) => ({ ...entry, words: entry.words.slice(0, 1) })) }, null, 2));
const polished = verbatim.fold(state, { event: "/verbatim/polish", transcript: "Tide Tables. The tide rises twice a day at Brest.", segments: [1, 2] });
console.log("after polish:", JSON.stringify(polished.settled));
