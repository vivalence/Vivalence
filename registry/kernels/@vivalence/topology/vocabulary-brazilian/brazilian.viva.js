// import topography from "./topography/index.js";
import topography from "./topography/index.js";
import dataset from "./dataset/index.js";

const manifest = {
  type: "topology",
  slug: "brazilian",
  name: "Brazilian Protuguese Vocabulary",
  version: "0.0.0",
  traits: ["TOPOGRAPHICAL", "DATASET"],
};

export { manifest, topography, dataset };
