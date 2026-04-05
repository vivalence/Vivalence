// import { specimen } from "@vivalence/typology";
// import { Vector, shape } from "@vivalence/typology";

// // --- primitives (not yet implemented) ---
// // import { Cortex, accumulate, tiers, nearest } from "@vivalence/typology";

// const tiers = {
//   frugal: [0.1, 0.3, 0.9],
//   balanced: [0.4, 0.6, 0.6],
//   capable: [0.6, 0.8, 0.4],
//   unleashed: [0.9, 1.0, 0.2],
// };

// function nearest(faculties, target) {
//   if (typeof target === "string") target = tiers[target] ?? [0.5, 0.5, 0.5];
//   let best = null;
//   let bestDistance = Infinity;
//   for (const faculty of faculties) {
//     const d = Math.sqrt(
//       (faculty.tune[0] - target[0]) ** 2 +
//         (faculty.tune[1] - target[1]) ** 2 +
//         (faculty.tune[2] - target[2]) ** 2,
//     );
//     if (d < bestDistance) {
//       bestDistance = d;
//       best = faculty;
//     }
//   }
//   return best;
// }

// function Cortex(faculties) {
//   const table = new Map();
//   for (const faculty of faculties) {
//     if (!table.has(faculty.type)) table.set(faculty.type, []);
//     table.get(faculty.type).push(faculty);
//   }

//   return {
//     table,

//     resolve(type, { tune, via } = {}) {
//       const candidates = table.get(type) || [];
//       const eligible = candidates.filter((f) => !via || f.via[via]);
//       return nearest(eligible, tune ?? [0.5, 0.5, 0.5]);
//     },

//     harness(types) {
//       const vector = new Vector();
//       for (const type of types) {
//         const branch = vector.branch(type);
//         const vias = new Set();
//         for (const faculty of this.table.get(type) || []) {
//           for (const v of Object.keys(faculty.via)) vias.add(v);
//         }
//         for (const v of vias) {
//           branch.open(v, async (input, ctx) => {
//             const faculty = this.resolve(type, { tune: ctx.tune, via: v });
//             return faculty.via[v](input.turns, ctx);
//           });
//         }
//       }
//       return vector;
//     },
//   };
// }

// function accumulate(turn, packet) {
//   switch (packet.event) {
//     case "turn.open":
//       return { ...packet.turn, parts: [] };
//     case "part.open":
//       turn.parts[packet.index] = { ...packet.part };
//       break;
//     case "part.delta":
//       const part = turn.parts[packet.index];
//       for (const [k, v] of Object.entries(packet.delta)) {
//         part[k] = typeof v === "string" && typeof part[k] === "string" ? part[k] + v : v;
//       }
//       break;
//     case "part.close":
//       break;
//     case "turn.close":
//       turn.meta = packet.meta;
//       break;
//   }
//   return turn;
// }

// // --- fixtures ---

// function makeFaculties() {
//   return [
//     {
//       type: "conversation",
//       tune: [0.9, 1.0, 0.3],
//       context: 200000,
//       channels: { in: ["text", "image", "tool_result"], out: ["text", "thinking", "tool_use"] },
//       via: {
//         render: async (turns) => ({
//           role: "assistant",
//           parts: [{ type: "text", text: "opus: " + turns.at(-1).parts[0].text }],
//           meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
//         }),
//         stream: async (turns) =>
//           (async function* () {
//             const text = "opus: " + turns.at(-1).parts[0].text;
//             yield { event: "turn.open", turn: { role: "assistant" } };
//             yield { event: "part.open", index: 0, part: { type: "text", text: "" } };
//             for (const ch of text) {
//               yield { event: "part.delta", index: 0, delta: { text: ch } };
//             }
//             yield { event: "part.close", index: 0 };
//             yield {
//               event: "turn.close",
//               meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
//             };
//           })(),
//       },
//     },
//     {
//       type: "conversation",
//       channels: { in: ["text", "image", "tool_result"], out: ["text", "tool_use"] },
//       tune: [0.3, 0.7, 0.8],
//       context: 200000,
//       via: {
//         render: async (turns) => ({
//           role: "assistant",
//           parts: [{ type: "text", text: "sonnet: " + turns.at(-1).parts[0].text }],
//           meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
//         }),
//         stream: async (turns) =>
//           (async function* () {
//             const text = "sonnet: " + turns.at(-1).parts[0].text;
//             yield { event: "turn.open", turn: { role: "assistant" } };
//             yield { event: "part.open", index: 0, part: { type: "text", text: "" } };
//             yield { event: "part.delta", index: 0, delta: { text } };
//             yield { event: "part.close", index: 0 };
//             yield {
//               event: "turn.close",
//               meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
//             };
//           })(),
//       },
//     },
//     {
//       type: "conversation",
//       channels: { in: ["text", "tool_result"], out: ["text"] },
//       tune: [0.1, 0.3, 1.0],
//       context: 200000,
//       via: {
//         render: async (turns) => ({
//           role: "assistant",
//           parts: [{ type: "text", text: "haiku: " + turns.at(-1).parts[0].text }],
//           meta: { usage: { input: 10, output: 5 }, stop: "end_turn" },
//         }),
//       },
//     },
//   ];
// }

// function userTurn(text) {
//   return { role: "user", parts: [{ type: "text", text }] };
// }

// // --- tests ---

// specimen.describe("cortex", () => {
//   specimen.describe("faculty resolution", () => {
//     specimen.it("indexes faculties by type", () => {
//       const cortex = Cortex(makeFaculties());
//       specimen.expect(cortex.table.get("conversation")).toHaveLength(3);
//       specimen.expect(cortex.table.has("speech")).toBe(false);
//     });

//     specimen.it("resolves nearest tune", () => {
//       const cortex = Cortex(makeFaculties());
//       const faculty = cortex.resolve("conversation", { tune: [0.8, 0.9, 0.4] });
//       specimen.expect(faculty.tune).toEqual([0.9, 1.0, 0.3]);
//     });

//     specimen.it("resolves from tier name", () => {
//       const cortex = Cortex(makeFaculties());
//       const faculty = cortex.resolve("conversation", { tune: "frugal" });
//       specimen.expect(faculty.tune).toEqual([0.1, 0.3, 1.0]);
//     });

//     specimen.it("filters by via before tune", () => {
//       const cortex = Cortex(makeFaculties());
//       const faculty = cortex.resolve("conversation", { tune: "frugal", via: "stream" });
//       specimen.expect(faculty.tune).toEqual([0.3, 0.7, 0.8]);
//     });

//     specimen.it("returns null for unknown type", () => {
//       const cortex = Cortex(makeFaculties());
//       const faculty = cortex.resolve("speech", { tune: "balanced" });
//       specimen.expect(faculty).toBeNull();
//     });
//   });

//   specimen.describe("accumulate", () => {
//     specimen.it("reduces packets into a sealed turn", () => {
//       const packets = [
//         { event: "turn.open", turn: { role: "assistant" } },
//         { event: "part.open", index: 0, part: { type: "text", text: "" } },
//         { event: "part.delta", index: 0, delta: { text: "Hello" } },
//         { event: "part.delta", index: 0, delta: { text: " world" } },
//         { event: "part.close", index: 0 },
//         { event: "turn.close", meta: { usage: { input: 5, output: 2 }, stop: "end_turn" } },
//       ];

//       let turn = null;
//       for (const packet of packets) turn = accumulate(turn, packet);

//       specimen.expect(turn.role).toBe("assistant");
//       specimen.expect(turn.parts).toHaveLength(1);
//       specimen.expect(turn.parts[0]).toEqual({ type: "text", text: "Hello world" });
//       specimen.expect(turn.meta.stop).toBe("end_turn");
//     });

//     specimen.it("accumulates multiple parts", () => {
//       const packets = [
//         { event: "turn.open", turn: { role: "assistant" } },
//         { event: "part.open", index: 0, part: { type: "text", text: "" } },
//         { event: "part.delta", index: 0, delta: { text: "thinking..." } },
//         { event: "part.close", index: 0 },
//         {
//           event: "part.open",
//           index: 1,
//           part: { type: "tool_use", id: "t1", name: "lookup", input: "" },
//         },
//         { event: "part.delta", index: 1, delta: { input: '{"word":' } },
//         { event: "part.delta", index: 1, delta: { input: '"casa"}' } },
//         { event: "part.close", index: 1 },
//         { event: "turn.close", meta: { stop: "tool_use" } },
//       ];

//       let turn = null;
//       for (const packet of packets) turn = accumulate(turn, packet);

//       specimen.expect(turn.parts).toHaveLength(2);
//       specimen.expect(turn.parts[0].text).toBe("thinking...");
//       specimen.expect(turn.parts[1].input).toBe('{"word":"casa"}');
//       specimen.expect(turn.meta.stop).toBe("tool_use");
//     });
//   });

//   specimen.describe("harness vector", () => {
//     specimen.it("cortex.harness builds branches per type, effects per via", () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);

//       const compiled = shape.object(harness);
//       specimen.expect(compiled.conversation).toBeDefined();
//       specimen.expect(typeof compiled.conversation.render).toBe("function");
//       specimen.expect(typeof compiled.conversation.stream).toBe("function");
//     });

//     specimen.it("render returns a sealed turn", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);
//       harness.use(async (ctx, next) => {
//         ctx.tune = ctx.input.tune ?? "balanced";
//         await next();
//       });

//       const compiled = shape.object(harness);
//       const turn = await compiled.conversation.render({
//         turns: [userTurn("hello")],
//         tune: "balanced",
//       });

//       specimen.expect(turn.role).toBe("assistant");
//       specimen.expect(turn.parts[0].type).toBe("text");
//       specimen.expect(turn.parts[0].text).toContain("hello");
//     });

//     specimen.it("stream returns packets that accumulate into a turn", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);
//       harness.use(async (ctx, next) => {
//         ctx.tune = ctx.input.tune ?? "unleashed";
//         await next();
//       });

//       const compiled = shape.object(harness);
//       const stream = await compiled.conversation.stream({
//         turns: [userTurn("hello")],
//         tune: "unleashed",
//       });

//       let turn = null;
//       for await (const packet of stream) {
//         turn = accumulate(turn, packet);
//       }

//       specimen.expect(turn.role).toBe("assistant");
//       specimen.expect(turn.parts[0].text).toContain("hello");
//       specimen.expect(turn.meta.stop).toBe("end_turn");
//     });

//     specimen.it("tune × via: frugal render picks haiku, frugal stream skips haiku", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);
//       harness.use(async (ctx, next) => {
//         ctx.tune = ctx.input.tune ?? "balanced";
//         await next();
//       });

//       const compiled = shape.object(harness);

//       const rendered = await compiled.conversation.render({
//         turns: [userTurn("test")],
//         tune: "frugal",
//       });
//       specimen.expect(rendered.parts[0].text).toMatch(/^haiku:/);

//       const stream = await compiled.conversation.stream({
//         turns: [userTurn("test")],
//         tune: "frugal",
//       });
//       let streamed = null;
//       for await (const packet of stream) {
//         streamed = accumulate(streamed, packet);
//       }
//       specimen.expect(streamed.parts[0].text).toMatch(/^sonnet:/);
//     });
//   });

//   specimen.describe("trait decoration", () => {
//     specimen.it("root middleware runs for all branches", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);

//       let middlewareRan = false;
//       harness.use(async (ctx, next) => {
//         ctx.tune = "balanced";
//         middlewareRan = true;
//         await next();
//       });

//       const compiled = shape.object(harness);
//       await compiled.conversation.render({ turns: [userTurn("hi")] });
//       specimen.expect(middlewareRan).toBe(true);
//     });

//     specimen.it("branch middleware only runs for its branch", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);

//       harness.use(async (ctx, next) => {
//         ctx.tune = "balanced";
//         await next();
//       });

//       let branchMwRan = false;
//       harness.branch("conversation").use(async (ctx, next) => {
//         branchMwRan = true;
//         await next();
//       });

//       const compiled = shape.object(harness);
//       await compiled.conversation.render({ turns: [userTurn("hi")] });
//       specimen.expect(branchMwRan).toBe(true);
//     });

//     specimen.it("branch middleware wraps effect (pre + post)", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);
//       const order = [];

//       harness.use(async (ctx, next) => {
//         ctx.tune = "balanced";
//         await next();
//       });

//       harness.branch("conversation").use(async (ctx, next) => {
//         order.push("pre");
//         await next();
//         order.push("post");
//       });

//       const compiled = shape.object(harness);
//       await compiled.conversation.render({ turns: [userTurn("hi")] });
//       specimen.expect(order).toEqual(["pre", "post"]);
//     });
//   });

//   specimen.describe("conversation flow (multi-turn)", () => {
//     specimen.it("client sends parent, server walks history", async () => {
//       const cortex = Cortex(makeFaculties());
//       const harness = cortex.harness(["conversation"]);

//       const turns = [];

//       harness.use(async (ctx, next) => {
//         ctx.tune = "balanced";
//         await next();
//       });

//       harness.branch("conversation").use(async (ctx, next) => {
//         const history = walkParents(ctx.input.parent, turns);
//         ctx.input.turns = [...history, ctx.input.turn];
//         await next();
//         turns.push({ ...ctx.input.turn, id: "t" + turns.length });
//         turns.push({ ...ctx.output, id: "t" + turns.length });
//       });

//       const compiled = shape.object(harness);

//       const r1 = await compiled.conversation.render({
//         parent: null,
//         turn: userTurn("hello"),
//       });
//       specimen.expect(r1.parts[0].text).toContain("hello");

//       const r2 = await compiled.conversation.render({
//         parent: "t1",
//         turn: userTurn("how are you"),
//       });
//       specimen.expect(r2.parts[0].text).toContain("how are you");
//       specimen.expect(turns).toHaveLength(4);
//     });
//   });
// });

// function walkParents(parentId, turns) {
//   if (!parentId) return [];
//   const chain = [];
//   let current = turns.find((t) => t.id === parentId);
//   while (current) {
//     chain.unshift(current);
//     current = current.parent ? turns.find((t) => t.id === current.parent) : null;
//   }
//   return chain;
// }
