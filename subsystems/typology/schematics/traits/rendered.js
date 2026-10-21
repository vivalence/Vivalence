import { v } from "../v.js";

export const Rendered = v.object(
  {
    frame: v.string().optional().desc('The slug of the view the buffer shows in the frame; absent, the compiled view first. Example: "play"'),
    cell: v.string().optional().desc('The slug of the view the buffer shows as its cell in the journal; absent, the first CELL view the chrome runs. Example: "board"'),
  },
  { additionalProperties: false },
);
