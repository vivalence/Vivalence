import { Vector } from "@vivalence/typology";

export const PRIMER = (mode) => {
  if (!mode.module.primer) throw new Error(`PRIMER: ${mode.manifest.slug} declares the trait and exports no primer`);
  mode.primer = new Vector().graft(mode.module.primer);
};
