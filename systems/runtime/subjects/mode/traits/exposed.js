import { shape } from "@vivalence/typology";

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.manifest.type}/${mode.manifest.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.proxy(mode.aperture);
  };
};
