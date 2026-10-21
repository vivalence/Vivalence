import { v } from "../v.js";
import * as mime from "../scalars/mime.js";
import { view } from "../traits/index.js";

export const ViewDescriptor = {
  $id: "View",
  own: {
    slug: v.string().desc('The view\'s name inside its mode, one per (mode, slug, mime). Example: "play"'),
    mime: mime.type().desc('What the code is. Example: "application/vnd.viva.tty.solid+javascript"'),
    entry: v.string().desc('The path of the File the client imports, among the view\'s own. Example: "board.js"'),
    traits: v.array(v.enum(Object.keys(view.properties))).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    mode: () => v.rel(v.mode()),
    files: () => v.array(v.file()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  traits: view,
  spoken: ["id", "slug", "mime", "mode", "entry"],
};
