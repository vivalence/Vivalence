import { mime, v } from "@vivalence/typology";
import { Reading } from "./schematics.js";

export const manifest = {
  type: "reader",
  slug: "reader",
  name: "Reader",
  description: "One article per buffer: a url in, a sandboxed original and a block list out.",
  version: "0.1.0",
  traits: ["VIEWABLE", "EXPOSED", "HARNESSED", "TOOLING", "FILESET"],
};

export const buffer = v.buffer({ data: Reading }).desc("One article being read. Example: { article: null }");

export const views = [{ slug: "reader", mount: "buffer/Reader.jsx", mime: mime.dom.solid }];

export const fileset = { path: "fonts" };

export { aperture } from "./aperture/index.js";

export { refine as tools } from "./tools/refine.js";
