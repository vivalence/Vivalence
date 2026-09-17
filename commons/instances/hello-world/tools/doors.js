import { v, Vector } from "@vivalence/typology";
import { report } from "./doctor.js";
import { COUNT, query } from "./wikipedia.js";
import { investigate } from "./research.js";

export const doors = new Vector()
  .open("/hello/doctor", (ctx) => report(ctx))
  .open("/hello/search", async (ctx) => {
    const terms = (ctx.input?.query ?? "").trim();
    if (!terms) return { results: [], count: 0 };
    try {
      const results = await query(terms, ctx.input?.count ?? COUNT);
      return { results, count: results.length };
    } catch (error) {
      return { results: [], count: 0, fault: error.message };
    }
  })
  .open(
    {
      nature: "/hello/research",
      yields: v.primitives.hallucination.Packet.Response,
    },
    investigate,
  );

export async function persona(ctx) {
  if (!ctx.daemon.cortex.findOne({ type: "object", via: "render" })) {
    return { greeting: "No hallucinator attached. Bot says high." };
  }

  const { output } = await ctx.mode.harness.object.render({
    turns: [{
      role: "user",
      parts: [{ type: "text", text: ctx.input.user }],
    }],
    output: v.object({
      greeting: v.string().desc("Your catchphrase response as HAL9000."),
    }),
  });
  return { greeting: output.object.greeting };
}
