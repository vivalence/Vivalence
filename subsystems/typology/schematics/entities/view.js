import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const ViewSchematic = {
  ...DataSchematic,
  $id: "View",
  is: "one compiled component of a mode: a slug, a mime, the file the client imports; a buffer pins views",
  own: {
    slug: v.string().desc("the view's name inside its mode, one per (mode, slug, mime)").example("play"),
    mime: mime.type().desc("what the code is").example("application/vnd.viva.tty.solid+javascript"),
    mount: v.union([v.string(), v.null()]).optional().desc("the declared source, relative to its mode's directory; null on a written view").example("buffer/board.jsx"),
    entry: v.string().desc("the path of the built File the client imports, among the view's own").example("bundle/board.tty.solid.mjs"),
    traits: traits.names.view.optional().desc("the trait names worn").example(["FRAME"]),
    trait: traits.view.default({}).optional().desc("trait data by name").example({ FRAME: {} }),
  },
  relations: {
    mode: () => v.rel().desc("the mode that ships it").example("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    files: () => v.array(v.file()).optional().desc("its files"),
    buffers: () => v.array(v.buffer()).optional().desc("buffers pinned to it"),
  },
  traits: traits.view,
  spoken: ["id", "slug", "mime", "mode", "entry"],
  examples: [{ id: "01a1b1c0-e798-7653-bb99-98e58df76a66", slug: "play", mime: "application/vnd.viva.dom.svelte+javascript", mount: "buffer/Play.svelte", entry: "bundle/play.dom.svelte.mjs", traits: ["FRAME"], trait: {}, mode: "01a1b1c0-dcc0-7117-be33-f73f77eb966b" }],
};
