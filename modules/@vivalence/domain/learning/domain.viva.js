import config from "@vivalence/config";

import aperture from "./aperture/index.js";
import entities from "./entities/index.js";
import modules from "./modules/index.js";
import lifecycle from "./lifecycle/index.js";

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
  traits: [],
};

const maps = { entities, modules };
export { manifest, lifecycle, maps, aperture };
