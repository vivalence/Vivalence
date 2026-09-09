import { v, Vector } from "@vivalence/typology";
import { COUNT, investigate, query, report } from "./tools/index.js";

export const aperture = new Vector()
  .open("/hello/doctor", (ctx) => report(ctx))
  // the same client web_search arms, on a second door — the app cannot reach the tools
  // Vector (TOOLED is in-process only), and duplicating the fetch would let the two drift.
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
  // the same researcher the model reaches as `research`, on a second door. one handler, no
  // adapter: the harness supplies ctx.thread, the app supplies ctx.input.thread. `yields` is
  // what wires it as a stream client-side — and an SSE request carries no timeout.
  .open(
    {
      nature: "/hello/research",
      yields: v.primitives.hallucination.Packet.Response,
    },
    investigate,
  )
  .open("/hello/bot", async (ctx) => {
    return { greeting: "Bot says high." };
  })
  .open("/hello/agent", async (ctx) => {
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
  });
