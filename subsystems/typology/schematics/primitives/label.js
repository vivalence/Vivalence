import { v } from "../v.js";

export const Label = v.object(
  {
    name: v
      .string()
      .desc(
        "The short display name the operator reads on the line — a subject, not a sentence. " +
          'Example: "Flamingo — six species"',
      ),
    description: v
      .string()
      .desc(
        "One sentence on what the thing holds, for the tooltip and the list. " +
          'Example: "Range, diet and the six species, from Wikipedia and two field guides."',
      )
      .optional(),
  },
  { $id: "Label" },
);
