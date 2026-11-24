import { shard, Signal, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { covered } from "./load.test.js";

const natures = (reference) => new Signal(reference).array.map((step) => step.nature);


const leaves = (vector, root) =>
  steer.trie.leaves(vector ?? new Vector()).map(({ pattern, steps }) => ({
    reference: `${root}/${steps.map((step) => new Signal(step.nature).array.map((held) => held.nature).join("/")).join("/")}`,
    valence: pattern.valence,
  }));
const signed = (vector, root) =>
  steer.trie.leaves(vector ?? new Vector()).map(({ pattern }, index) => ({
    ...leaves(vector, root)[index],
    input: pattern.input,
    output: pattern.output,
  }));
const detailed = {
  modes: (entry) => ({ reference: entry.reference, valence: entry.mode.manifest.description }),
  outline: (entry) => ({
    ...detailed.modes(entry),
    tools: leaves(entry.mode.tools, entry.reference),
    primers: leaves(entry.mode.primer, entry.reference),
  }),
  signatures: (entry) => ({ ...detailed.outline(entry), tools: signed(entry.mode.tools, entry.reference) }),
};

const Entry = v.object({ reference: v.string(), valence: v.string().optional() });
const modes = new Vector().open(
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
  (ctx) => ({ output: { modes: covered(ctx, ctx.input.reference).map(detailed[ctx.input.detail]) } }),
);

specimen.describe("a reference, read against ctx.runtime and ctx.daemon", () => {
  specimen.it("each reference collects what it covers", async () => {
    const mode = (type, slug) => ({ manifest: { type, slug } });
    const harvest = await accio("@education/tactic/harvest");
    const nyan = await accio("@education/game/nyan");
    const education = {
      reference: "/daemon/education",
      modes: { tactic: { harvest }, game: { nyan }, teacher: { francesca: mode("teacher", "francesca") } },
    };
    const chess = { reference: "/daemon/chess", modes: { teacher: { francesca: mode("teacher", "francesca") } } };
    const runtime = {
      reference: "/runtime/runtime",
      modes: { harness: { runtime: mode("harness", "runtime") } },
      daemons: { education, chess },
    };
    const tools = new Vector().graft(modes);
    tools
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education))
      .use(shard.context.bind("reference", education.reference))
      .use(shard.context.bind("mode", education.modes.teacher.francesca));
    const run = (input) => steer.dispatch.invoke(tools, new ToolCall("modes_index"), steer.strategy.guarded)(input);
    const cut = (text) => (text && text.length > 60 ? `${text.slice(0, 60)}…` : text);
    const out = [];
    for (const input of [{ reference: "/daemon/education", detail: "modes" }, { reference: "/daemon/education/mode/tactic" }]) {
      const result = await run(input);
      out.push(`modes_index ${JSON.stringify(input)}`);
      for (const mode of result.output.modes) {
        out.push(`mode   ${mode.reference}`, `       ${cut(mode.valence)}`);
        for (const tool of mode.tools ?? []) out.push(`tool   ${tool.reference}`, `       ${cut(tool.valence)}`);
        for (const primer of mode.primers ?? []) out.push(`primer ${primer.reference}`, `       ${cut(primer.valence)}`);
      }
    }
    const sizes = [];
    for (const reference of ["/daemon/education/mode/game", "/daemon/education"])
      for (const detail of ["modes", "outline", "signatures"])
        sizes.push(`${reference} · ${detail} · ${JSON.stringify((await run({ reference, detail })).output).length} chars`);
    out.push(...sizes);
    console.log(`\n${out.join("\n")}`);
  });
});
