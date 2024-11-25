import eventhandlers from "./eventhandlers/index.js";
import methods from "./methods/boot.js";
import middlewares from "./middlewares/index.js";

async function boot(runtime) {
  await middlewares.boot(runtime);
  await methods.boot(runtime);
  await eventhandlers.boot(runtime);
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
