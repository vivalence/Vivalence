import { specimen, Vector, shape } from "@vivalence/typology";

// typology primitives
import { Cortex, tiers, nearest } from "./typology/cortex.js";
import { accumulate, observe, drain } from "./typology/accumulate.js";

// services
import { provider as anthropicProvider } from "./services/anthropic.js";
import { provider as openrouterProvider } from "./services/openrouter.js";

// daemon
import { populateCortex } from "./daemon/population.js";
import { applyHarness, resolve } from "./daemon/traits.js";

// client
import { repl } from "./client/repl.js";

// --- fixtures ---

function userTurn(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

async function makeDaemon() {
  const daemon = { services: {}, _turnStore: [] };
  await populateCortex(daemon, [anthropicProvider, openrouterProvider]);
  return daemon;
}

function makeMode(daemon, contextEffects = {}) {
  const mode = { context: new Vector() };
  for (const [name, fn] of Object.entries(contextEffects)) {
    mode.context.open(name, fn);
  }
  applyHarness(mode, daemon);
  return mode;
}

// --- tests ---

specimen.describe("cortex (integrated)", () => {
  // ─────────────────────────────────────────────
  // 1. Population: services → faculties → cortex
  // ─────────────────────────────────────────────

  specimen.describe("population", () => {
    specimen.it("collects faculties from both providers", async () => {
      const daemon = await makeDaemon();
      specimen.expect(daemon.cortex).toBeDefined();
      specimen.expect(daemon.cortex.table.get("conversation").length).toBeGreaterThanOrEqual(5);
      specimen.expect(daemon.cortex.table.get("speech").length).toBe(2);
      specimen.expect(daemon.cortex.table.get("object").length).toBe(1);
    });
  });

  // ─────────────────────────────────────────────
  // 2. Faculty resolution: tune × via × type
  // ─────────────────────────────────────────────

  specimen.describe("faculty resolution", () => {
    specimen.it("resolves nearest tune across providers", async () => {
      const daemon = await makeDaemon();
      // unleashed should pick anthropic opus [0.9, 1.0, 0.3]
      const opus = daemon.cortex.resolve("conversation", { tune: "unleashed" });
      specimen.expect(opus.tune).toEqual([0.9, 1.0, 0.3]);

      // frugal render should pick haiku [0.1, 0.3, 1.0]
      const haiku = daemon.cortex.resolve("conversation", { tune: "frugal", via: "render" });
      specimen.expect(haiku.tune).toEqual([0.1, 0.3, 1.0]);

      // frugal stream — haiku has no stream, should pick openrouter llama [0.2, 0.5, 0.9]
      const llama = daemon.cortex.resolve("conversation", { tune: "frugal", via: "stream" });
      specimen.expect(llama.tune).toEqual([0.2, 0.5, 0.9]);
    });

    specimen.it("resolves speech faculties", async () => {
      const daemon = await makeDaemon();
      const speech = daemon.cortex.resolve("speech", { tune: "balanced" });
      specimen.expect(speech).toBeDefined();
      specimen.expect(speech.channels.out).toContain("audio");
    });
  });

  // ─────────────────────────────────────────────
  // 3. Harness + mode.harness compilation
  // ─────────────────────────────────────────────

  specimen.describe("harness compilation", () => {
    specimen.it("mode.harness has branches for all faculty types", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      specimen.expect(typeof mode.harness.conversation.render).toBe("function");
      specimen.expect(typeof mode.harness.conversation.stream).toBe("function");
      specimen.expect(typeof mode.harness.speech.render).toBe("function");
      specimen.expect(typeof mode.harness.speech.stream).toBe("function");
      specimen.expect(typeof mode.harness.object.render).toBe("function");
    });
  });

  // ─────────────────────────────────────────────
  // 4. Conversation: render
  // ─────────────────────────────────────────────

  specimen.describe("conversation render", () => {
    specimen.it("returns a sealed turn", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const turn = await mode.harness.conversation.render({
        turns: [userTurn("hello")],
        tune: "balanced",
      });

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].type).toBe("text");
      specimen.expect(turn.parts[0].text).toContain("hello");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("tune selects provider: unleashed → opus, frugal → haiku", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const opus = await mode.harness.conversation.render({
        turns: [userTurn("test")],
        tune: "unleashed",
      });
      specimen.expect(opus.parts[0].text).toMatch(/opus/);

      const haiku = await mode.harness.conversation.render({
        turns: [userTurn("test")],
        tune: "frugal",
      });
      specimen.expect(haiku.parts[0].text).toMatch(/haiku/);
    });
  });

  // ─────────────────────────────────────────────
  // 5. Conversation: stream
  // ─────────────────────────────────────────────

  specimen.describe("conversation stream", () => {
    specimen.it("returns async iterable of packets that accumulate", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const stream = await mode.harness.conversation.stream({
        turns: [userTurn("hello")],
        tune: "unleashed",
      });

      const turn = await drain(stream);
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toContain("hello");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("frugal stream skips haiku (no stream via), picks next best", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const stream = await mode.harness.conversation.stream({
        turns: [userTurn("test")],
        tune: "frugal",
      });
      const turn = await drain(stream);
      // haiku has no stream, so should fall through to llama or sonnet
      specimen.expect(turn.parts[0].text).not.toMatch(/haiku/);
    });
  });

  // ─────────────────────────────────────────────
  // 6. Context vector
  // ─────────────────────────────────────────────

  specimen.describe("context vector", () => {
    specimen.it("prepends system turns from context vector effects", async () => {
      const daemon = await makeDaemon();

      // mock faculty that echoes ALL turns (not just last user)
      // we'll check that system turn appears in the input
      let capturedTurns = null;
      const origResolve = daemon.cortex.resolve.bind(daemon.cortex);
      // patch a faculty to capture turns
      const allFaculties = daemon.cortex.table.get("conversation");
      const original = allFaculties[1].via.render;
      allFaculties[1].via.render = async (turns, ctx) => {
        capturedTurns = turns;
        return original(turns, ctx);
      };

      const mode = makeMode(daemon, {
        personality: () => ({
          turns: [{ role: "system", parts: [{ type: "text", text: "You are a tutor." }] }],
        }),
        instructions: (state) => ({
          turns: [{ role: "system", parts: [{ type: "text", text: `Tune: ${state.tune}` }] }],
        }),
      });

      await mode.harness.conversation.render({
        turns: [userTurn("hi")],
        tune: "balanced",
      });

      specimen.expect(capturedTurns).toBeDefined();
      // system turns should be prepended
      specimen.expect(capturedTurns[0].role).toBe("system");
      specimen.expect(capturedTurns[0].parts[0].text).toBe("You are a tutor.");
      specimen.expect(capturedTurns[1].role).toBe("system");
      specimen.expect(capturedTurns[1].parts[0].text).toBe("Tune: balanced");
      // user turn follows
      specimen.expect(capturedTurns[2].role).toBe("user");

      // restore
      allFaculties[1].via.render = original;
    });

    specimen.it("config from context vector flows to faculty", async () => {
      const daemon = await makeDaemon();

      let capturedCtx = null;
      const allFaculties = daemon.cortex.table.get("conversation");
      const original = allFaculties[1].via.render;
      allFaculties[1].via.render = async (turns, ctx) => {
        capturedCtx = ctx;
        return original(turns, ctx);
      };

      const mode = makeMode(daemon, {
        temperature: () => ({ config: { temperature: 0.7 } }),
      });

      await mode.harness.conversation.render({
        turns: [userTurn("hi")],
        tune: "balanced",
      });

      specimen.expect(capturedCtx.temperature).toBe(0.7);
      allFaculties[1].via.render = original;
    });
  });

  // ─────────────────────────────────────────────
  // 7. Multi-turn with persistence
  // ─────────────────────────────────────────────

  specimen.describe("multi-turn persistence", () => {
    specimen.it("parent chain builds history, turns persist to store", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const r1 = await mode.harness.conversation.render({
        parent: null,
        turn: userTurn("hello"),
        tune: "balanced",
      });
      specimen.expect(r1.id).toBeDefined();

      const r2 = await mode.harness.conversation.render({
        parent: r1.id,
        turn: userTurn("how are you"),
        tune: "balanced",
      });
      specimen.expect(r2.id).toBeDefined();

      // 4 turns persisted: user, assistant, user, assistant
      specimen.expect(daemon._turnStore).toHaveLength(4);
      // second assistant's parent chain should reach first user
      const lastAssistant = daemon._turnStore[3];
      specimen.expect(lastAssistant.role).toBe("assistant");
    });

    specimen.it("stream path also persists turns on drain", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const stream = await mode.harness.conversation.stream({
        parent: null,
        turn: userTurn("streamed message"),
        tune: "balanced",
      });

      // before drain: user turn exists, assistant doesn't yet
      const preCount = daemon._turnStore.length;

      const turn = await drain(stream);

      // after drain: assistant turn persisted
      specimen.expect(daemon._turnStore.length).toBe(preCount + 1);
      const saved = daemon._turnStore.at(-1);
      specimen.expect(saved.role).toBe("assistant");
      specimen.expect(saved.parts[0].text).toContain("streamed message");
    });
  });

  // ─────────────────────────────────────────────
  // 8. Observe primitive
  // ─────────────────────────────────────────────

  specimen.describe("observe", () => {
    specimen.it("wraps stream, calls onSealed when consumer drains", async () => {
      let sealed = null;
      const raw = (async function* () {
        yield { event: "turn.open", turn: { role: "assistant" } };
        yield { event: "part.open", index: 0, part: { type: "text", text: "" } };
        yield { event: "part.delta", index: 0, delta: { text: "hello" } };
        yield { event: "part.close", index: 0 };
        yield { event: "turn.close", meta: { stop: "end_turn" } };
      })();

      const observed = observe(raw, (turn) => { sealed = turn; });

      // sealed is null before drain
      specimen.expect(sealed).toBeNull();

      const turn = await drain(observed);
      specimen.expect(turn.parts[0].text).toBe("hello");

      // sealed fires after drain
      specimen.expect(sealed).toBeDefined();
      specimen.expect(sealed.parts[0].text).toBe("hello");
    });
  });

  // ─────────────────────────────────────────────
  // 9. Resolve: tool-execution loop
  // ─────────────────────────────────────────────

  specimen.describe("resolve (tool loop)", () => {
    specimen.it("loops on tool_use, returns final turn after tool_result", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const tools = {
        lookup: {
          execute: async (input) => ({ definition: `${input.query} means house` }),
        },
      };

      // anthropic opus mock returns tool_use on first call if tools provided,
      // then end_turn after seeing tool_result
      const turn = await resolve(mode.harness, {
        turns: [userTurn("what is casa")],
        tune: "unleashed",
        tools,
      });

      specimen.expect(turn.meta.stop).toBe("end_turn");
      specimen.expect(turn.parts[0].text).toContain("casa");
    });
  });

  // ─────────────────────────────────────────────
  // 10. Speech
  // ─────────────────────────────────────────────

  specimen.describe("speech", () => {
    specimen.it("render returns audio part", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const turn = await mode.harness.speech.render({
        turns: [{ role: "user", parts: [{ type: "text", text: "olá mundo" }] }],
        tune: "balanced",
      });

      specimen.expect(turn.parts[0].type).toBe("audio");
      specimen.expect(turn.parts[0].media).toBe("audio/mp3");
      specimen.expect(turn.parts[0].data.length).toBeGreaterThan(0);
    });

    specimen.it("stream returns audio packets", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const stream = await mode.harness.speech.stream({
        turns: [{ role: "user", parts: [{ type: "text", text: "falar" }] }],
        tune: "balanced",
      });

      const turn = await drain(stream);
      specimen.expect(turn.parts[0].type).toBe("audio");
      specimen.expect(turn.parts[0].data.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  // 11. Object (structured output)
  // ─────────────────────────────────────────────

  specimen.describe("object", () => {
    specimen.it("render returns object part with schema", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);

      const turn = await mode.harness.object.render({
        turns: [userTurn("extract entities")],
        tune: "balanced",
        schema: { type: "object", properties: { entities: { type: "array" } } },
      });

      specimen.expect(turn.parts[0].type).toBe("object");
      specimen.expect(turn.parts[0].data).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // 12. REPL client (programmatic)
  // ─────────────────────────────────────────────

  specimen.describe("repl client", () => {
    specimen.it("send() calls conversation render and gets response", async () => {
      const daemon = await makeDaemon();
      const mode = makeMode(daemon);
      const client = repl(mode.harness, { tune: "balanced" });

      // programmatic send — just verify it doesn't throw
      // (repl.send writes to stdout, we're testing the wiring)
      await client.send("hello from test");
    });

    specimen.it("command() switches tune", () => {
      const daemon = { cortex: null, _turnStore: [] };
      // just test command parsing, no harness needed
      const client = repl({}, { tune: "balanced" });
      const result = client.command("/tune unleashed");
      specimen.expect(result).toBe(true);
    });
  });
});
