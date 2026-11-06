import { mime, v } from "@vivalence/typology";
import { Settings } from "./schematics.js";

export const manifest = {
  type: "editor",
  slug: "darkroom",
  name: "Darkroom",
  description: "A picture desk: a prompt and dropped references go to the picture faculty, the pictures come back onto the frame.",
  version: "0.1.0",
  traits: ["VIEWABLE", "HARNESSED", "CONVERSATIONAL", "EXPOSED"],
};

export const buffer = v.buffer({ data: Settings }).desc("One desk: the ask, its references, every picture hallucinated, the one shown. Example: { prompt: '', pictures: [] }");

export const views = [{ slug: "darkroom", mount: "buffer/Darkroom.jsx", mime: mime.dom.solid }];

export { aperture } from "./aperture/index.js";
