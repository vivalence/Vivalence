import methods from "./methods/index.js";
import middlewares from "./middlewares/index.js";

async function boot(runtime) {
  await middlewares.boot(runtime);
  await methods.boot(runtime);

  return runtime;
}

const manifest = {
  type: "Domain",
  slug: "base",
  name: "Base",
  description: "Basic domain with units tags ebisu and annotations",
};

export { manifest, boot };
