import { v } from "@vivalence/typology";

export const Reference = v.object({
  file: v.string().desc('A File on this buffer. Example: "01a1bd04-54c5-74ca-bc57-45381377cd82"'),
  role: v.enum(["style", "subject", "structure"]).desc("How it steers the painter. Example: style"),
});

export const Picture = v.object({
  file: Reference.properties.file,
  prompt: v.string().desc("What it was asked for. Example: a heron at dusk, film grain"),
  parent: v.union([v.string(), v.null()]).desc("The picture it iterated on, a File id or null. Example: null"),
  references: v.array(Reference).desc("The references it was steered by. Example: []"),
  model: v.string().desc("The painter. Example: openai/gpt-image-2"),
  aspect: v.string().desc("Its aspect. Example: 3:2"),
});

export const Settings = v.object({
  prompt: v.string().default("").desc("The next ask. Example: a heron at dusk, film grain"),
  next: v.enum(["iterate", "fresh"]).default("iterate").desc("Whether the shown picture seeds the next. Example: iterate"),
  model: v.string().default("openai/gpt-image-2").desc("The painter. Example: black-forest-labs/flux.2-pro"),
  aspect: v.string().default("3:2").desc("The frame. Example: 16:9"),
  count: v.integer().default(1).desc("Pictures per hallucination, 1–4. Example: 2"),
  references: v.array(Reference).default([]).desc("What steers the next picture. Example: []"),
  pictures: v.array(Picture).default([]).desc("Every picture on this desk, oldest first. Example: []"),
  shown: v.union([v.string(), v.null()]).default(null).desc("The picture on the frame, a File id. Example: null"),
});
