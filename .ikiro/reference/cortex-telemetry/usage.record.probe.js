import { Controller, Span, belt, v } from "@vivalence/typology";

const controller = new Controller({ stdout: new Span("hallucination") });
const faculty = { type: "choice", provider: "bench", id: "bench/choice", via: { render: async () => ({ same: 0.9 }) } };
await belt.hallucinate.choose(faculty, { system: {}, questions: { same: { type: "noul", ask: "same?" } } }, { controller });
const record = controller.stdout.history.find((record) => record.track === "usage");
console.log(JSON.stringify(record, null, 2));
console.log([...v.primitives.track.Track.errors(record.track)].length, "faults on track");
