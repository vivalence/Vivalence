import { Vector } from "@vivalence/typology";

import * as hal from "./hal/index.js";
import { gather } from "./gather.js";

export const harness = new Vector() //
  .use(async (ctx, next) => {
    ctx.hallucination.context.system(
      [
        hal.assistant.identity,
        hal.assistant.mission,
        hal.assistant.capabilities,
        hal.assistant.language(ctx.daemon.statics?.language),
      ].join("\n\n"),
    );
    await next();
    // console.log("HARNESS after()", ctx.input, ctx.output);
  })
  .branch("object")
  .use(async (ctx, next) => {
    // optionally: further context, additional tools.
    await next();
  }).root;

// // the learner report rides every aprende render — tutor + tools pick configs from it
// harness.use(async (ctx, next) => {
//   ctx.hallucination.add((await gather(ctx)).toPrompt());
//   await next();
// });

// // scope-in: aprende's own tools on the /object surface (the helpdesk path).
// // Mode-scoped absorb — the daemon-wide table stays a /dialogue-only concern.
// harness.branch("/object").use(async (ctx, next) => {
//   const tools = shape.agentic(ctx.daemon.cortex.tools.branch(ctx.mode.slug));
//   console.log("aprende harness tools", tools);
//   ctx.hallucination.absorb(tools);
//   await next();
// });

// // turn loading + persistence for the /object surface (the helpdesk's single-shot // /assistant/message ask) — one middleware, the harness's own /object branch, not // duplicated per call site. Loads history, registers the prompt as a user turn, // splices history ahead of the caller's turns for continuity, then registers the // rendered object as the assistant turn once render resolves.
// harness.branch("/object").use(async (ctx, next) => {
//   if (!ctx.input.thread) return next();

//   const history = await ctx.daemon.entities.turn.history({ thread: ctx.input.thread });
//   const userTurn = await ctx.daemon.entities.turn.chain({
//     role: "user",
//     parts: ctx.input.turns.at(-1)?.parts ?? [],
//     parent: history.at(-1) ?? null,
//     thread: ctx.input.thread,
//     mode: ctx.mode.id,
//   });

//   ctx.input.turns = [
//     ...history.map((turn) => ({ role: turn.role, parts: turn.parts })),
//     ...ctx.input.turns,
//   ];

//   await next();

//   if (ctx.output?.object) {
//     await ctx.daemon.entities.turn.chain({
//       role: "assistant",
//       parts: [{ type: "object", data: ctx.output.object }],
//       parent: userTurn,
//       thread: ctx.input.thread,
//       mode: ctx.mode.id,
//     });
//     await ctx.daemon.entities.em.flush();
//   }//
// });
