import topology from "./topology/index.js";

const manifest = {
  type: "corpus",
  slug: "eng-to-lat",
  name: "English to Latin",
  version: "0.0.5",
  traits: ["TOPOLOGICAL", "DATASET"],
};

export { manifest, topology };
