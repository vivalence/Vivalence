import events from "./events/index.js";
import aperture from "./aperture/index.js";
// import middlewares from "./middlewares/index.js";

// move the curriculum.install here.
function boot(runtime) {
  // await middlewares.boot(runtime);
  aperture.boot(runtime);
  events.boot(runtime);

  return runtime;
}

// TODO
// const modules = {memory: ["@vivalence/memory/bayesian", "@vivalence/memory/boolean"]};

const manifest = {
  type: "domain",
  slug: "base",
  name: "Base",
  description: "Basic domain with units tags ebisu and annotations",
  version: "0.0.2",
};

export { boot, manifest };
