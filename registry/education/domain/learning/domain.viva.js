// import * as da from "./aperture/index.js";

// export * as topography from "./topography/index.js";
export * from "./entities/index.js";
export * from "./modes/index.js";
export * from "./aperture/index.js";

export const manifest = {
  type: "domain",
  slug: "language-learning",
  name: "Language Learning",
  description: "Domain for learning with literals symbols ebisu and annotations",
  version: "0.0.5",
  traits: ["EXPOSED"],
};
