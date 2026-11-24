import { mime, v } from "@vivalence/typology";
import { Desk } from "./schematics.js";

export const manifest = {
  type: "publisher",
  slug: "blog",
  name: "Blog",
  description:
    "A blog written and pressed in one place: a .md · .org under source/ in its mountpoint " +
    "becomes a page under public/, an essay when it is dated; " +
    "every other file there is served from where it lies.",
  version: "0.4.0",
  traits: ["EXPOSED", "ATTACHED", "SURFACED", "FILESET"],
};

export const buffer = v
  .buffer({ data: Desk })
  .desc(
    "The writing desk: its panels, their widths, the mode, the settings, the source on it.",
  )
  .example({ open: "on/machines.md", mode: "focus", inspector: { tab: "outline" } });

export const fileset = { path: "files" };

export const surfaces = [{ slug: "blog", mount: "buffer/Blog.jsx", mime: mime.dom.solid }];

export { aperture } from "./aperture/index.js";
export { attachment } from "./attachment.js";
export { twitch } from "./twitch.js";
export { boot } from "./boot.js";
