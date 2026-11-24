import { v, Vector } from "@vivalence/typology";
import { guide } from "./guide.js";
import { current, located } from "./screen.js";

const LAST = guide.steps.length - 1;
const STEP = v.integer({ minimum: 0, maximum: LAST }).desc(`Step number from the [Guide] index, 0 to ${LAST}. Example: 2`);

const page = (index) => {
  const step = guide.steps[index];
  return [
    `step ${index} · ${step.section} · ${step.title} · parts ${step.parts.join(" ") || "none"}`,
    ...step.warn.map((line) => `WARN ${line}`),
    ...step.text.map((line, at) => `${at + 1}. ${line}`),
    ...Object.entries(step.prep).map(([key, value]) => `${key}: ${value}`),
  ].join("\n");
};

export const tools = new Vector()
  .open(
    {
      nature: "/guide/read",
      valence: "Read one step of the guide in full — warnings, numbered instructions, bolts and tools. " +
        "The [Guide] index only names steps; read before you instruct. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    (ctx) => ({ message: page(ctx.input.step) }),
  )
  .open(
    {
      nature: "/guide/step",
      valence: "Put a step on the operator's screen — the 3D view moves to it. 0 is the overview. " +
        "Returns where the screen now is. Example: { step: 2 }",
      input: v.object({ step: STEP }),
    },
    async (ctx) => {
      const row = await current(ctx);
      if (!row) throw new Error("no pt10 buffer is open on this thread — ask the operator to open the guide first");
      row.data = { ...row.data, step: ctx.input.step };
      await ctx.daemon.entities.em.flush();
      return { message: located(row), buffer: [row] };
    },
  );
