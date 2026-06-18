import dataset from "./dataset/index.js";

const manifest = {
  type: "corpus",
  slug: "english-to-spanish",
  name: "Castilian Spanish Vocabulary",
  version: "0.1.0",
  traits: ["DATASET"],
};

export { manifest, dataset };
