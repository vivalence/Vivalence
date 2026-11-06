import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Named = v.object({ name: v.string().desc('The attachment\'s file name, the rest of the line. Example: "notes.md"') });

export const detach = new Vector().open(
  { nature: "/detach", valence: "drop an attachment. Example: /detach notes.md", input: Named },
  (ctx) => {
    const { name } = belt.input.cast(Named, belt.input.lined(ctx.signal));
    throw new Error(`no attachments on this wire — /detach ${name}: drop an attachment`);
  },
);
