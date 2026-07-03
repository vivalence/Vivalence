import { shape } from "@vivalence/typology";

export * from "./dataset.js";
export * from "./intented.js";
export * from "./emitter.js";
export * from "./application.js";
export * from "./harnessed.js";
export * from "./conversational.js";
export * from "./tooled.js";

export const SELFEVIDENT = () => {};

// marker: only STANDALONE modes can be created/rendered without an emitter (direct buffer from MASKED)
export const STANDALONE = () => {};

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.type}/${mode.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.object(mode.aperture);
  };
};

export const FRAUGHT = async (mode, daemon) => {
  await mode.module.freight.index();
  mode.aperture.open("/freight", () => mode.module.freight.catalog);
};
