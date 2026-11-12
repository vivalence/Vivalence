// limit: 4000 chars
// run from the repo root, an image (tesseract spawned) or a kept tsv:
// deno run -A --no-check --config deno.jsonc .ikiro/reference/ocr/page.probe.js .ikiro/reference/ocr/one-word.png
import { Controller, Cortex, Span, v, verbatim } from "@vivalence/typology";

const { Word, Verbatim } = v.primitives.hallucination;

const Paged = v.object({
  ...Word.properties,
  page: v.integer({ minimum: 1 }).optional().desc("The page it stands on, counted from 1. Example: 1"),
  box: v
    .array(v.number({ minimum: 0, maximum: 1 }), { minItems: 4, maxItems: 4 })
    .optional()
    .desc("Where on the page, as fractions of it: left, top, width, height. Example: [0.1033, 0.37, 0.31, 0.28]"),
});

const Final = v.object({
  ...Verbatim.Final.properties,
  words: v.array(Paged).optional(),
});

const read = async (binary, path) =>
  path.endsWith(".tsv")
    ? await Deno.readTextFile(path)
    : new TextDecoder().decode((await new Deno.Command(binary, { args: [path, "-", "tsv"] }).output()).stdout);

const fraction = (length, whole) => Math.round((length / whole) * 10000) / 10000;

async function* translate(tsv) {
  const cells = (await tsv).trim().split("\n").slice(1).map((held) => held.split("\t"));
  const sheets = new Map(cells.filter((held) => held[0] === "1").map((held) => [held[1], [Number(held[8]), Number(held[9])]]));
  const words = cells.filter((held) => held[0] === "5");
  for (const block of new Set(words.map((held) => `${held[1]}/${held[2]}`))) {
    const held = words.filter((word) => `${word[1]}/${word[2]}` === block);
    yield {
      event: "/verbatim/final",
      transcript: held.map((word) => word[11]).join(" "),
      words: held.map((word) => {
        const [width, height] = sheets.get(word[1]);
        return {
          word: word[11],
          confidence: Math.round(Number(word[10])) / 100,
          page: Number(word[1]),
          box: [fraction(word[6], width), fraction(word[7], height), fraction(word[8], width), fraction(word[9], height)],
        };
      }),
    };
  }
}

const tesseract = {
  type: "verbatim",
  id: "tesseract-5",
  tune: [0.2, 0.9, 1.0],
  channels: { in: ["document", "image"], out: ["event"] },
  via: { stream: (source) => translate(read("tesseract", source)) },
};

const nova = {
  type: "verbatim",
  id: "nova-3",
  tune: [0.5, 0.9, 0.6],
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
  via: { stream: async function* () {} },
};

const controlled = () => new Controller({ stdout: new Span("ocr") });
const cortex = new Cortex().register(tesseract);

let state = verbatim.empty;
for await (const event of await cortex.hallucinate.verbatim.stream({ controller: controlled(), source: Deno.args[0] })) {
  const faults = event.event === "/verbatim/final" ? [[...Verbatim.Final.errors(event)].length, [...Final.errors(event)].length] : [];
  console.log(event.event, ...faults.map((count, index) => `${["tree", "sketch"][index]} Final errors: ${count}`));
  state = verbatim.fold(state, event);
}
console.log(JSON.stringify(state, null, 2));
console.log("render:", JSON.stringify(await cortex.hallucinate.verbatim.render({ controller: controlled(), source: Deno.args[0] })));

const both = cortex.split(nova);
try {
  both.findOne({ type: "verbatim", via: "render" });
} catch (fault) {
  console.log("two verbatim faculties, bare:", fault.message);
}
for (const tier of ["frugal", "fast", "balanced", "capable", "unleashed"]) {
  console.log("two verbatim faculties, tier", tier, "→", both.findOne({ type: "verbatim", via: "render", tier }).id);
}
