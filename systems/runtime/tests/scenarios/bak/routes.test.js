// import { specimen } from "@vivalence/typology";
// import { IntentEntity } from "@vivalence/typology/entities";
// import { create } from "./daemon.js";

// specimen.describe("daemon routes (scenario)", () => {
//   let scenario;

//   specimen.beforeAll(async () => {
//     scenario = await create();
//   });

//   specimen.afterAll(async () => {
//     await scenario.orm.close();
//   });

//   specimen.describe("freight", () => {
//     specimen.it("returns cargo", async () => {
//       const result = await scenario.conn.call("/cargo");
//       specimen.expect(result.test).toBe(true);
//       specimen.expect(result.version).toBe("0.0.1");
//     });
//   });

//   specimen.describe("datamap", () => {
//     specimen.it("find literals", async () => {
//       const result = await scenario.conn.call("/entities/literal/find", {
//         where: {},
//         options: { limit: 10 },
//       });
//       specimen.expect(result.length).toBe(2);
//     });

//     specimen.it("findOne literal by slug", async () => {
//       const result = await scenario.conn.call("/entities/literal/findOne", {
//         where: { slug: "hello" },
//       });
//       specimen.expect(result.slug).toBe("hello");
//       specimen.expect(result.trait.TRANSLATED.learning).toBe("olá");
//     });

//     specimen.it("find symbols", async () => {
//       const result = await scenario.conn.call("/entities/symbol/find", {
//         where: {},
//       });
//       specimen.expect(result.length).toBe(1);
//       specimen.expect(result[0].slug).toBe("greeting");
//     });

//     specimen.it("find intents", async () => {
//       const result = await scenario.conn.call("/entities/intent/find", {
//         where: {},
//       });
//       specimen.expect(result.length).toBe(1);
//       specimen.expect(result[0].slug).toBe("survival-flashcard");
//     });

//     specimen.it("findOne intent by slug", async () => {
//       const result = await scenario.conn.call("/entities/intent/findOne", {
//         where: { slug: "survival-flashcard" },
//       });
//       specimen.expect(result.slug).toBe("survival-flashcard");
//       specimen.expect(result.type).toBe("SELFEVIDENT");
//       specimen.expect(result.traits).toEqual(["FURNISHED"]);
//       specimen.expect(result.trait.FURNISHED.recall).toBe("LEARNING");
//     });

//     specimen.it("intent has mode relation", async () => {
//       const result = await scenario.conn.call("/entities/intent/findOne", {
//         where: { slug: "survival-flashcard" },
//       });
//       specimen.expect(result.mode).toBeTruthy();
//     });
//   });

//   specimen.describe("modes", () => {
//     specimen.it("findOne mode by slug", async () => {
//       const result = await scenario.conn.call("/modes/game/findOne", {
//         where: { slug: "flashcard" },
//       });
//       specimen.expect(result.manifest.slug).toBe("flashcard");
//     });

//     specimen.it("VIEWABLE mode includes view url", async () => {
//       const result = await scenario.conn.call("/modes/game/findOne", {
//         where: { slug: "flashcard" },
//       });
//       specimen.expect(result.view.url).toBeTruthy();
//     });

//     specimen.it("mode has new traits", async () => {
//       const result = await scenario.conn.call("/modes/game/findOne", {
//         where: { slug: "flashcard" },
//       });
//       specimen.expect(result.manifest.traits).toContain("SELFEVIDENT");
//       specimen.expect(result.manifest.traits).toContain("INTENTED");
//       specimen.expect(result.manifest.traits).toContain("EMITTER");
//     });
//   });

//   specimen.describe("userspace", () => {
//     specimen.it("handshake requires auth", async () => {
//       const response = await scenario.conn.fetch("/userspace/handshake");
//       specimen.expect(response.status).toBe(401);
//     });

//     specimen.it("entities require auth", async () => {
//       const response = await scenario.conn.fetch("/userspace/entities/session/find", {});
//       specimen.expect(response.status).toBe(401);
//     });
//   });

//   specimen.describe("INTENTED trait", () => {
//     specimen.it("upserts intents from dataset", async () => {
//       const intents = await scenario.em.find(IntentEntity, {});
//       const traitIntent = intents.find((i) => i.slug === "survival-flashcard");
//       specimen.expect(traitIntent).toBeTruthy();
//     });

//     specimen.it("intent has correct type and traits", async () => {
//       const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
//       specimen.expect(intent.type).toBe("SELFEVIDENT");
//       specimen.expect(intent.traits).toEqual(["FURNISHED"]);
//     });

//     specimen.it("intent symbols resolved to entities", async () => {
//       const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" }, { populate: ["symbols"] });
//       specimen.expect(intent.symbols.length).toBe(1);
//       specimen.expect(intent.symbols[0].slug).toBe("greeting");
//     });

//     specimen.it("intent queryable via datamap", async () => {
//       const result = await scenario.conn.call("/entities/intent/findOne", {
//         where: { slug: "survival-flashcard" },
//       });
//       specimen.expect(result.slug).toBe("survival-flashcard");
//     });
//   });

//   specimen.describe("EMITTER trait", () => {
//     specimen.it("compiles callable on mode.emit", () => {
//       specimen.expect(scenario.mode.emit).toBeTruthy();
//       specimen.expect(typeof scenario.mode.emit.literal).toBe("function");
//     });

//     specimen.it("mode.emit.literal returns buffer-shaped POJOs", async () => {
//       const result = await scenario.mode.emit.literal({
//         literal: { id: scenario.fixtures.hello.id },
//       });
//       specimen.expect(Array.isArray(result)).toBe(true);
//       specimen.expect(result.length).toBe(1);
//       specimen.expect(result[0].mode).toBe(scenario.fixtures.mode.id);
//       specimen.expect(result[0].status).toBe("PENDING");
//       specimen.expect(result[0].traits).toEqual(["FURNISHED"]);
//     });

//     specimen.it("normalizes single return to array", async () => {
//       const result = await scenario.mode.emit.literal({ literal: { id: "test" } });
//       specimen.expect(Array.isArray(result)).toBe(true);
//     });

//     specimen.it("emitter has daemon + mode in context", async () => {
//       const result = await scenario.mode.emit.literal({
//         literal: { id: scenario.fixtures.hello.id },
//       });
//       specimen.expect(result[0].mode).toBe(scenario.fixtures.mode.id);
//     });

//     specimen.it("/emit/literal HTTP route responds", async () => {
//       const result = await scenario.conn.call(
//         "/mode/game/flashcard/emit/literal",
//         { literal: { id: scenario.fixtures.hello.id } },
//       );
//       specimen.expect(Array.isArray(result)).toBe(true);
//       specimen.expect(result[0].status).toBe("PENDING");
//     });
//   });

//   specimen.describe("entities (direct)", () => {
//     specimen.it("intent entity boots and seeds", () => {
//       specimen.expect(scenario.fixtures.intent).toBeTruthy();
//       specimen.expect(scenario.fixtures.intent.slug).toBe("survival-flashcard");
//       specimen.expect(scenario.fixtures.intent.type).toBe("SELFEVIDENT");
//     });

//     specimen.it("intent has traits and data", () => {
//       specimen.expect(scenario.fixtures.intent.traits).toEqual(["FURNISHED"]);
//       specimen.expect(scenario.fixtures.intent.trait.FURNISHED.recall).toBe("LEARNING");
//     });

//     specimen.it("session has mode", () => {
//       specimen.expect(scenario.fixtures.session.mode).toBeTruthy();
//     });

//     specimen.it("session has intent", () => {
//       specimen.expect(scenario.fixtures.session.intent).toBeTruthy();
//     });

//     specimen.it("mode entity has new traits", () => {
//       const traits = scenario.fixtures.mode.traits;
//       specimen.expect(traits).toContain("VIEWABLE");
//       specimen.expect(traits).toContain("SELFEVIDENT");
//       specimen.expect(traits).toContain("INTENTED");
//       specimen.expect(traits).toContain("EMITTER");
//     });
//   });
// });
