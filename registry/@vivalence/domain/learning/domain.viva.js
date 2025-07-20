import config from "@vivalence/config";

import aperture from "./aperture/index.js";
import data from "./data/index.js";
import boot from "./boot/index.js";

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
  traits: [],
};

async function install(runtime) {
  const promises = [];
  for (const dimension of runtime.ontology.dimension) {
    for (const category of dimension.descendants) {
      // if (promises.length > 0) break;
      const tag = {
        data: {
          ONTOLOGICAL: {
            branch: dimension.slug,
            leaf: category.slug,
          },
        },
      };
      const assertion = runtime.assert.tag(tag, ["EXISTENTIAL"]);
      promises.push(assertion);
    }
  }
  await Promise.all(promises);
}

export { manifest, boot, data, aperture, install }; // modules
// aperture and modules are aspirationally

// const tag = {data: {ONTOLOGICAL: {branch: "advtype", leaf: "loc",},},};
// const ass = await runtime.assert.tag(tag, ["EXISTENTIAL"]);
// // const ass = await runtime.validate.tag(tag, ["EXISTENTIAL"]);
// const ass = await runtime.entities.tag.findOne(tag);
// console.log("ass", ass);
