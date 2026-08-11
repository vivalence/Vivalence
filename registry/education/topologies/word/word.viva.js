// export * as topography from "./topography/index.js";
// export * from "./aperture.js";

import { Dataset } from "@vivalence/typology";

export const manifest = {
  type: "topology",
  slug: "word",
  name: "Words after Universal Dependencies",
  version: "0.2.0",
  traits: ["DATASET"],
};

export const dataset = new Dataset({ symbol: "dataset/symbols" });
