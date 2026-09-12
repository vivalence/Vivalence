import provider from "./provider/index.js";
export { provider };

export const manifest = {
  type: "hallucinator",
  slug: "stub",
};

export const docs = {
  name: "Stub Faculty Provider",
  description:
    "Deterministic offline faculties — dialogue at three tunes, object, verbatim, speech. " +
    "The script is a pure function of the request: @directives in the prompt (or settings.script), " +
    "and named scripts on statics.scripts reached with @run. It holds no key, so it is never dormant.",
};
