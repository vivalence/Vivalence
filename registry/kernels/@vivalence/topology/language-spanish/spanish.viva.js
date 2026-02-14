export * as topography from "./topography/index.js";
import dataset from "./dataset/index.js";
export { dataset };

export const manifest = {
  type: "topology",
  slug: "spanish",
  name: "Spanish",
  version: "0.0.5",
  traits: ["TOPOGRAPHICAL", "DATASET"],
};
