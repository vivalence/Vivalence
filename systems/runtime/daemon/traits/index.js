import { Freight, is, shape } from "@vivalence/typology";

export async function stagger(mode, daemon, traits) {
  const finalizers = [];
  for (const trait of mode.traits) {
    const result = await traits[trait]?.(mode, daemon);
    if (is.fn(result)) finalizers.push(result);
  }
  return finalizers;
}

export * from "./dataset.js";
export * from "./intented.js";
export * from "./emitter.js";
export * from "./application.js";
export * from "./generative.js";
export * from "./harnessed.js";
export * from "./tooled.js";
export * from "./agentic.js";

export const SELFEVIDENT = () => {};

// marker: only STANDALONE modes can be created/rendered without an emitter (direct buffer from MASKED)
export const STANDALONE = () => {};

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.type}/${mode.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.proxy(mode.aperture);
  };
};

export const FRAUGHT = async (mode, daemon) => {
  mode.freight = new Freight(mode.module.mount.dirname + mode.module.freight.path.nature);
  mode.freight.withUrl(daemon.attach.branch("/cargo").branch(daemon.mount.nature));
  await mode.freight.index();
  mode.aperture.open("/freight", () => mode.freight.catalog);
};
