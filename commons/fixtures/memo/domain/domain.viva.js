export * as traits from "./traits/index.js";
export { aperture } from "./aperture/index.js";
export { tools } from "./tools/index.js";
export { harness } from "./harness.js";
export * from "./types.js";

export const manifest = {
  type: "domain",
  slug: "srs",
  name: "Spaced Repetition",
  description: "Anki's SM-2 over the daemon's literals: a card's retention and its traced grades are notes, suspension too; feed · novel · due · byStrength · byStatus · sample · leeches deal, review grades.",
  version: "0.1.0",
  traits: ["EXPOSED", "TOOLING"],
};
