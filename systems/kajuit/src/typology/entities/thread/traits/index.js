// trait capabilities, grouped by trait — surfaced as ThreadTraits.{aimed,queueing,conversational}.
// no flat run-all barrel anymore (applyTraits is gone); each trait is its own namespace, and
// consumers reach the one capability they need. labeled/masked stay internal (dossier imports
// them directly) — only the app-facing traits are grouped here.
export * as aimed from "./aimed.js";
export * as queueing from "./queueing.js";
export * as conversational from "./conversational.js";
