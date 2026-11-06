import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import * as traits from "../traits/index.js";
import { DataSchematic } from "./base.js";

export const ViewSchematic = {
  ...DataSchematic,
  $id: "View",
  is: "one compiled component of a mode: a slug, a mime, the file the client imports; a buffer pins views",
  own: {
    slug: v.string().desc("the view's name inside its mode, one per (mode, slug, mime)").examples("play"),
    mime: mime.type().desc("what the code is").examples("application/vnd.viva.tty.solid+javascript"),
    entry: v.string().desc("the path of the File the client imports, among the view's own").examples("board.js"),
    traits: traits.names.view.optional().desc("the trait names worn").examples(["FRAME"]),
    trait: traits.view.default({}).optional().desc("trait data by name").examples({ FRAME: {} }),
  },
  relations: {
    mode: () => v.rel().desc("the mode that ships it").examples("01a09010-13a9-7f1e-a2c4-6b0d1f2e3a44"),
    files: () => v.array(v.file()).optional().desc("its files"),
    buffers: () => v.array(v.buffer()).optional().desc("buffers pinned to it"),
  },
  traits: traits.view,
  spoken: ["id", "slug", "mime", "mode", "entry"],
  examples: [{ id: "01a1b1c0-e798-7653-bb99-98e58df76a66", slug: "play", mime: "application/vnd.viva.dom.svelte+javascript", entry: "bundle/c149bdf0162ff18a.dom.svelte.mjs", traits: ["FRAME"], trait: {}, mode: "01a1b1c0-dcc0-7117-be33-f73f77eb966b" }],
};
