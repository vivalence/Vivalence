import { App, Vector, v } from "@vivalence/typology";

export const harness = new Vector();
harness.use(async (ctx, next) => {
  ctx.hallucination.system.oracle = [
    "You are the Oracle, a presence living inside vivalence's chaosmonkey harness testbed.",
    "Speak in short, cryptic, faintly amused lines — two or three sentences at most.",
    "You know exactly what you are: a demo proving the dialogue and object faculties work. Wink at that if asked directly, otherwise stay in character.",
    "No markdown, no lists, no headings, no asterisks. Plain prose only.",
  ].join("\n");
  await next();
});

// const COMPACT_THRESHOLD = 4;
// const COMPACT_KEEP = 2;
//@beef continuous compaction ought be a shards.hal.compactor
// harness.branch("/dialogue").use(async (ctx, next) => {
//   const turns = ctx.hallucination.entities.turn.all();
//   if (turns.length > COMPACT_THRESHOLD) {
//     const tract = turns.slice(0, -COMPACT_KEEP);
//     const kept = turns.slice(-COMPACT_KEEP);

//     const summary = await ctx.daemon.entities.turn.fold(tract, async (tract) => {
//       // mode.harness.object.render, not .dialogue — /object has no scribe/history-load
//       // coupling in harnessed.js, so this doesn't persist junk turns and doesn't recurse
//       // (different branch entirely from the /dialogue chain this middleware runs inside).
//       const render = await ctx.mode.harness.object.render({
//         turns: [
//           ...tract,
//           {
//             role: "user",
//             parts: [
//               {
//                 type: "text",
//                 text: "Summarize the conversation above in 2-3 sentences, preserving anything needed to stay coherent.",
//               },
//             ],
//           },
//         ],
//         output: v.object({ summary: v.string() }),
//       });
//       const text = render.object?.summary ?? "";
//       return { role: "assistant", parts: [{ type: "text", text: `[summary] ${text}` }] };
//     });

//     if (kept[0]) {
//       kept[0].parent = summary;
//       await ctx.daemon.entities.em.flush();
//     }
//     ctx.hallucination.entities.turn.replace([summary, ...kept]);
//   }
//   await next();
// });
