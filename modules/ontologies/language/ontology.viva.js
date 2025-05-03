import topology from "./topology/index.js";
import { validators } from "@vivalence/shared";

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Language after Universal Dependencies",
  version: "0.1.0",
  traits: ["BOOTABLE", "TOPOLOGICAL", "DATASET"],
};

export { manifest, topology };
