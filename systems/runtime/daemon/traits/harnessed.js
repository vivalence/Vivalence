import { Hallucination, Vector, shape, steer, shard, soma } from "@vivalence/typology";

export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");

  // console.log(daemon.aperture);

  const harness = new Vector();

  harness.use(shard.context.bind("daemon", daemon));
  harness.use(shard.context.bind("mode", mode));

  // harness.use(async (ctx, next) => {await next();});

  harness.use(async (ctx, next) => {
    ctx.hallucination = new Hallucination(daemon.cortex, ctx.input);

    await next();

    if (ctx.output?.[Symbol.asyncIterator]) {
      const source = ctx.output;
      let turn = null;
      let parent = ctx.turn;
      const created = [];
      ctx.output = (async function* () {
        try {
          for await (const packet of source) {
            turn = soma.pour(turn, packet);
            if (packet.event === "/turn/close") {
              parent = ctx.daemon.entities.turn.create({
                role: turn.role,
                parts: turn.parts,
                meta: turn.meta,
                parent,
                thread: ctx.input.thread,
                mode: ctx.mode.id,
              });
              created.push(parent);
              turn = null;
            }
            yield packet;
          }
          await ctx.daemon.entities.em.flush();
        } catch (error) {
          for (const entity of created) ctx.daemon.entities.em.remove(entity);
          throw error;
        }
      })();
    } else if (ctx.output?.role) {
      ctx.daemon.entities.turn.create({
        role: ctx.output.role,
        parts: ctx.output.parts,
        meta: ctx.output.meta,
        parent: ctx.turn,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
      await ctx.daemon.entities.em.flush();
    }
  });

  harness.branch("/dialogue").use(async (ctx, next) => {
    const history = await ctx.daemon.entities.turn.find(
      { thread: ctx.input.thread },
      { orderBy: { createdAt: "ASC" } },
    );
    ctx.turn = ctx.daemon.entities.turn.create({
      role: "user",
      parts: ctx.input.parts,
      parent: history.at(-1) ?? null,
      thread: ctx.input.thread,
      mode: ctx.mode.id,
    });
    await ctx.daemon.entities.em.flush();
    ctx.hallucination.turns = [...history, ctx.turn];
    await next();
  });

  harness.branch("/dialogue").use(async (ctx, next) => {
    ctx.hallucination.absorb(shape.agentic(ctx.daemon.cortex.tools));
    await next();
  });

  return () => {
    if (mode.cake.harness) harness.slurp(mode.cake.harness);
    daemon.cortex.shard.faculties(harness);

    mode.harness = shape.object(harness, steer.echo);

    mode.aperture.branch("/harness").slurp(harness);

    mode.aperture.open("/capabilities", (ctx) =>
      ["dialogue", /* "speech", "verbatim", */ "object"] //
        .filter((type) => ctx.daemon.cortex.has(type))
        .map((type) => ({
          type,
          stream: !!ctx.daemon.cortex.resolve(type, { via: "stream" }),
          render: !!ctx.daemon.cortex.resolve(type, { via: "render" }),
        })),
    );
  };
};

// export const CHAOSMONKEY = (mode, daemon) => {
//   const harness = new Vector();
//   // harness.use(async (ctx,next) => { ctx.hallucination = new Hallucination(...ctx); ...f(ctx.hallucination) ;await next();})
//   if (mode.cake.harness) harness.slurp(mode.cake.harness);
//   // harness.use(shard.attach(daemon/mode))

//   // f(.harness, daemon.cortex)
//   // f(vector, cortex) => [dialogue, speech, verbatim, object]
//   //   .filter(faculty => cortex.has(faculty))
//   //   .map(faculty => {vector.branch(faculty).open("render", shard.render).open("stream", shart.stream)})

//   // mode.aperture expose -> fy(harness)

//   // mode.harness = shape.object(harness, steer.echo)

//   // ref
//   // steer.request(carry, effect, steps, signal) => async (input) =>
//   // shape.object(vector, execute = steer.request, signal = new Signal(), steps = [])

//   //mode.cake.harness*default-minimal harness*daemon.cortex.faculties
//   // ctx.hallucinate = mw ctx * mode.harness. shard.provide
// };

// import { Vector, shape, soma } from "@vivalence/typology";

// export const CHAOSMONKEY = async (mode, daemon) => {
//   const harness = new Vector();

//   // Layer 1: context — resolve thread, attach ambient state
//   harness.use(async (ctx, next) => {
//     ctx.daemon = daemon;
//     ctx.mode = mode;
//     ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
//     await next();
//   });
// harness.use(daemon.cortex.shard.harness) //

//   // Layer 2: setup — load history, create user turn, spawn hallucinate
//   harness.use(async (ctx, next) => {
//     const history = await daemon.entities.turn.find(
//       { thread: ctx.thread },
//       { orderBy: { createdAt: "ASC" } },
//     );

//     ctx.turn = daemon.entities.turn.create({
//       role: "user",
//       parts: [{ type: "text", text: ctx.input.message }],
//       parent: history.at(-1) ?? null,
//       thread: ctx.thread,
//       mode: mode.id,
//     });
//     await daemon.entities.em.flush();

//     await next();
//   });

//   // Layer 3: output — persistence via inline scribe pattern
//   harness.use(async (ctx, next) => {
//     await next();

//     if (!ctx.output) {
//       ?? throw
//     }

//     if (ctx.output?.[Symbol.asyncIterator]) {
//       const stream = ctx.output;
//       let turn = null;
//       let parent = ctx.turn;
//       const created = [];

//       ctx.output = (async function* () {
//         try {
//           for await (const packet of stream) {
//             turn = soma.pour(turn, packet);
//             if (packet.event === "/turn/close") {
//               parent = daemon.entities.turn.create({
//                 role: turn.role,
//                 parts: turn.parts,
//                 meta: turn.meta,
//                 parent,
//                 thread: ctx.thread,
//                 mode: mode.id,
//               });
//               created.push(parent);
//               turn = null;
//             }
//             yield packet;
//           }
//           await daemon.entities.em.flush();
//         } catch (error) {
//           for (const entity of created) daemon.entities.em.remove(entity);
//           throw error;
//         }
//       })();
//     } else if (ctx.output?.role) {
//       daemon.entities.turn.create({
//         role: ctx.output.role,
//         parts: ctx.output.parts,
//         meta: ctx.output.meta,
//         parent: ctx.turn,
//         thread: ctx.thread,
//         mode: mode.id,
//       });
//       await daemon.entities.em.flush();
//     }
//   });

//   harness.slurp(mode.cake.harness);

//   mode.aperture.branch("/harness")
//   .use(async (ctx, next) => {
//     await next();
//     if (ctx.output?.[Symbol.asyncIterator]) {
//       ctx.response.publish(ctx.output); //@beef will want to get rid of this.
//     }
//   }).slurp(harness);
// };

// import { soma } from "@vivalence/typology";

// export class Hallucinate {
//   constructor(cortex) {
//     this.cortex = cortex;
//     this.turns = [];
//     this.tools = {};
//     this.tuning = "balanced";
//     this.config = {};

//     this.dialogue = {
//       render: () => this.render("dialogue"),
//       stream: () => this.stream("dialogue"),
//     };

//     this.speech = {
//       render: () => this.render("speech"),
//       stream: () => this.stream("speech"),
//     };

//     this.verbatim = {
//       render: () => this.render("verbatim"),
//       stream: () => this.stream("verbatim"),
//     };

//     this.object = {
//       render: () => this.render("object"),
//     };
//   }

//   add(...args) {
//     for (const arg of args) {
//       if (!arg)                    continue;
//       if (typeof arg === "string") { this.turns.push({ role: "system", parts: [{ type: "text", text: arg }] }); continue; }
//       if (Array.isArray(arg))      { this.add(...arg); continue; }
//       if (arg.role)                { this.turns.push(arg); continue; }
//     }
//     return this;
//   }

//   tool(name, spec) {
//     this.tools[name] = spec;
//     return this;
//   }

//   tune(tier) {
//     this.tuning = tier;
//     return this;
//   }

//   configure(config) {
//     Object.assign(this.config, config);
//     return this;
//   }

// shard.harness.MATERIAL!:
//   *protocol() {
//     let turns = [...this.turns];
//     const config = { ...this.config };
//     if (Object.keys(this.tools).length) config.tools = this.tools;

//     for (let round = 0; round < 10; round++) {
//       const turn = yield { call: { turns, config } };
//       if (turn.meta?.stop !== "tool_use") return turn;
//       const results = yield { execute: turn.parts };
//       turns = [...turns, turn, { role: "user", parts: results }];
//     }
//   }

// shard.harness.MATERIAL!:
//   async execute(parts) {
//     const results = [];
//     for (const part of parts) {
//       if (part.type !== "tool_use") continue;
//       const tool = this.tools[part.name];
//       const handler = typeof tool === "function" ? tool : tool?.execute;
//       if (!handler) {
//         results.push({ type: "tool_result", id: part.id, output: { error: `unknown tool: ${part.name}` } });
//         continue;
//       }
//       const input = typeof part.input === "string" ? JSON.parse(part.input) : part.input;
//       const output = await handler(input);
//       results.push({ type: "tool_result", id: part.id, output });
//     }
//     return results;
//   }

// shard.harness.MATERIAL!:
//   async render(type) {
//     const faculty = this.cortex.resolve(type, { tune: this.tuning, via: "render" });
//     const program = this.protocol();
//     let step = program.next();
//     while (!step.done) {
//       if (step.value.call) {
//         const { turns, config } = step.value.call;
//         step = program.next(await faculty.via.render(turns, config));
//       } else {
//         step = program.next(await this.execute(step.value.execute));
//       }
//     }
//     return step.value;
//   }

// shard.harness.MATERIAL!:
//   async* stream(type) {
//     const faculty = this.cortex.resolve(type, { tune: this.tuning, via: "stream" });
//     const program = this.protocol();
//     let step = program.next();
//     while (!step.done) {
//       if (step.value.call) {
//         const { turns, config } = step.value.call;
//         let turn = null;
//         for await (const packet of await faculty.via.stream(turns, config)) {
//           turn = soma.pour(turn, packet);
//           yield packet;
//         }
//         step = program.next(turn);
//       } else {
//         const results = await this.execute(step.value.execute);
//         yield* soma.drain({ role: "user", parts: results });
//         step = program.next(results);
//       }
//     }
//   }
// }

// OLD
// this was done by conversational but conversational is taking on the rolle of session composer and all this is done by the chaosmonkey and cortex/harness.
// export const CONVERSATIONAL = async (mode, daemon) => {
//   if (!mode.cake.dialogue) return;

//   const dialogue = new Vector();

//   // Layer 1: context — resolve thread, attach ambient state
//   dialogue.use(async (ctx, next) => {
//     ctx.daemon = daemon;
//     ctx.mode = mode;
//     ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
//     await next();
//   });
//   // dialogue.use(mode.harness.shard.hallucinator())

//   // Layer 2: setup — load history, create user turn, spawn hallucinate
//   dialogue.use(async (ctx, next) => {
//     const history = await daemon.entities.turn.find(
//       { thread: ctx.thread },
//       { orderBy: { createdAt: "ASC" } },
//     );

//     ctx.turn = daemon.entities.turn.create({
//       role: "user",
//       parts: [{ type: "text", text: ctx.input.message }],
//       parent: history.at(-1) ?? null,
//       thread: ctx.thread,
//       mode: mode.id,
//     });
//     await daemon.entities.em.flush();

//     ctx.hallucinate = daemon.cortex
//       .spawn()
//       .add(...history, ctx.turn)
//       .tune(ctx.input.tune ?? mode.cake.tune ?? "balanced");

//     await next();
//   });

//   // Layer 3: output — persistence via inline scribe pattern
//   dialogue.use(async (ctx, next) => {
//     await next();

//     if (!ctx.output) {
//       ctx.output = await ctx.hallucinate.dialogue.stream();
//     }

//     if (ctx.output?.[Symbol.asyncIterator]) {
//       const stream = ctx.output;
//       let turn = null;
//       let parent = ctx.turn;
//       const created = [];

//       ctx.output = (async function* () {
//         try {
//           for await (const packet of stream) {
//             turn = soma.pour(turn, packet);
//             if (packet.event === "/turn/close") {
//               parent = daemon.entities.turn.create({
//                 role: turn.role,
//                 parts: turn.parts,
//                 meta: turn.meta,
//                 parent,
//                 thread: ctx.thread,
//                 mode: mode.id,
//               });
//               created.push(parent);
//               turn = null;
//             }
//             yield packet;
//           }
//           await daemon.entities.em.flush();
//         } catch (error) {
//           for (const entity of created) daemon.entities.em.remove(entity);
//           throw error;
//         }
//       })();
//     } else if (ctx.output?.role) {
//       daemon.entities.turn.create({
//         role: ctx.output.role,
//         parts: ctx.output.parts,
//         meta: ctx.output.meta,
//         parent: ctx.turn,
//         thread: ctx.thread,
//         mode: mode.id,
//       });
//       await daemon.entities.em.flush();
//     }
//   });

//   dialogue.slurp(mode.cake.dialogue);

//   const branch = mode.aperture.branch("/dialogue");
//   branch.use(async (ctx, next) => {
//     await next();
//     if (ctx.output?.[Symbol.asyncIterator]) {
//       ctx.response.publish(ctx.output);
//     }
//   });
//   branch.slurp(dialogue);
// };
