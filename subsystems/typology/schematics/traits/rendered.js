import { v } from "../v.js";

export const Rendered = v.object(
  {
    frame: v.string().optional().desc('The slug of the surface the buffer shows in the frame; absent, the compiled surface first. Example: "play"'),
    cell: v.string().optional().desc('The slug of the surface the buffer shows as its cell in the journal; absent, the first CELL surface the chrome runs. Example: "board"'),
  },
  { additionalProperties: false },
);
