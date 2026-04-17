import { shape } from "@vivalence/typology";

export * from "./dataset.js";
export * from "./intented.js";
export * from "./emitter.js";
export * from "./buffered.js";
export * from "./chaosmonkey.js";
export * from "./conversational.js";

export const SELFEVIDENT = () => {};

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
  await mode.cake.freight.index();
  mode.aperture.open("/freight", () => mode.cake.freight.catalog);
};
