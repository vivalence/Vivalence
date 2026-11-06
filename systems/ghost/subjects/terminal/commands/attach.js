import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Named = v.object({ name: v.string().desc('The attachment\'s file name, the rest of the line. Example: "notes.md"') });

export const attach = new Vector().open(
  { nature: "/attach", valence: "attach a file to the next turn. Example: /attach notes.md", input: Named },
  (ctx) => {
    const { name } = belt.input.cast(Named, belt.input.lined(ctx.signal));
    throw new Error(`no attachments on this wire — /attach ${name}: attach a file to the next turn`);
  },
);
