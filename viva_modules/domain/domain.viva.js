import methods from "./methods/index.js";

// import middlewares from "./middlewares/index.js"; // middlewares.boot(runtime);

async function boot(runtime) {
  await methods.boot(runtime);

  return runtime;
}

export default {
  manifest: {
    type: "Domain",
    slug: "base",
    name: "Base",
    description: "Basic domain with units tags ebisu and annotations",
  },
  boot,
};
