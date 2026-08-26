export * from "./entities/index.js";
export * from "./aperture/index.js";
export * from "./types.js";

export const manifest = {
  type: "domain",
  slug: "srs",
  name: "Spaced Repetition",
  description: "Anki-style SRS domain: cards as literals, SM-2 retentions, review traces.",
  version: "0.1.0",
  traits: ["EXPOSED"],
};
