import { Vector } from "@vivalence/typology";

export const manifest = { type: "home", slug: "probe", version: "0.0.1", traits: ["RUNTIME", "EXPOSED", "TOOLING", "DATASET"] };
export const aperture = new Vector().open("/ping", (_, ctx) => ({ reference: ctx.reference.absolute, mode: ctx.mode.manifest.slug, note: "note" in ctx.entities, daemon: ctx.daemon ?? null }));
export const tools = new Vector();
export const dataset = {};
