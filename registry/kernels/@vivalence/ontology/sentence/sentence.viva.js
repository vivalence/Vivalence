// export * as topography from "./topography/index.js";
// export * from "./aperture.js";

import dataset from "./dataset/index.js";

export const manifest = {
  type: "ontology",
  slug: "sentence",
  name: "Sentences",
  version: "0.1.1",
  traits: ["DATASET"],
};

export { dataset };
