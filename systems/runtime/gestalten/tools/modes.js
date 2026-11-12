import { shape, v, Vector } from "@vivalence/typology";
import { covered, listed } from "../reference/index.js";

const Entry = v.object({ reference: v.string(), valence: v.string().optional() });

const leaves = (vector, root) =>
  listed(vector ?? new Vector(), root).map(({ reference, valence }) => ({ reference, valence }));

const signed = (vector, root) =>
  shape.primer.nodes(vector ?? new Vector()).map((node) => ({
    reference: `${root}/${node.nature}`,
    valence: node.valence,
    input: node.pattern.input,
    output: node.pattern.output,
  }));

const DETAILED = {
  modes: (entry) => ({ reference: entry.reference, valence: entry.mode.manifest.description }),
  outline: (entry) => ({
    ...DETAILED.modes(entry),
    tools: leaves(entry.mode.tools, entry.reference),
    primers: leaves(entry.mode.primer, entry.reference),
  }),
  signatures: (entry) => ({ ...DETAILED.outline(entry), tools: signed(entry.mode.tools, entry.reference) }),
};

export const modes = new Vector().open(
  {
    nature: "/modes/index",
    valence:
      "Lists the modes a reference covers: each mode, its tools and its primer sections, by absolute reference. " +
      "A wider reference and a higher detail both return more text into this thread: start narrow.",
    input: v
      .object({
        reference: v.string(),
        detail: v.enum(["modes", "outline", "signatures"]).default("outline"),
      })
      .eg(
        { reference: "/daemon/education/mode/tactic" },
        { reference: "/runtime", detail: "modes" },
        { reference: "/daemon/education", detail: "modes" },
      ),
    output: v
      .object({
        modes: v.array(
          v.object({
            reference: v.string(),
            valence: v.string().optional(),
            tools: v.array(Entry).optional(),
            primers: v.array(Entry).optional(),
          }),
        ),
      })
      .eg({
        modes: [
          {
            reference: "/daemon/education/mode/game/nyan",
            valence: "A typing trainer.",
            tools: [{ reference: "/daemon/education/mode/game/nyan/play", valence: "Opens the trainer." }],
            primers: [],
          },
        ],
      }),
  },
  (ctx) => ({ output: { modes: covered(ctx, ctx.input.reference).map(DETAILED[ctx.input.detail]) } }),
);
