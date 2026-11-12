import { shard, Signal, specimen, steer, ToolCall, v, Vector } from "@vivalence/typology";
import { accio } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/registry.js";

const flat = (host) => Object.values(host.modes).flatMap((type) => Object.values(type));
const natures = (reference) => new Signal(reference).array.map((step) => step.nature);
const covers = (reference, absolute) => natures(reference).every((nature, index) => natures(absolute)[index] === nature);
const absolute = (host, mode) => `${host.reference}/mode/${mode.manifest.type}/${mode.manifest.slug}`;

const resolve = (ctx, reference) => {
  const hosts = [ctx.runtime, ...Object.values(ctx.runtime.daemons)];
  const held = hosts.flatMap((host) => flat(host).map((mode) => ({ reference: absolute(host, mode), mode })));
  const readings = [reference, `${ctx.daemon.reference}/mode${reference}`];
  return held.filter((entry) => readings.some((reading) => covers(reading, entry.reference)));
};

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
  (ctx) => ({ output: { modes: resolve(ctx, ctx.input.reference).map(detailed[ctx.input.detail]) } }),
);

export { modes,resolve,detailed };
