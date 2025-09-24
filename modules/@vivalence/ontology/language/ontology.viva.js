import topology from "./topology/index.js";

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Language after Universal Dependencies",
  version: "0.1.1",
  traits: ["BOOTABLE", "TOPOLOGICAL", "DATASET"],
};

// const predicates = {requirements: [{domain: "@vivalence/domain/learning", version: "^0.1",},], constraints: [],};

export { manifest, topology };
