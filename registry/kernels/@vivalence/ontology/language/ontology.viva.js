export * as topography from "./topography/index.js";
export * from "./aperture.js";
import dataset from "./dataset/index.js";

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Language after Universal Dependencies",
  version: "0.1.1",
  traits: ["TOPOGRAPHICAL", "DATASET"],
};

// const predicates = {requirements: [{domain: "@vivalence/domain/learning", version: "^0.1",},], constraints: [],};

export { manifest, dataset };
