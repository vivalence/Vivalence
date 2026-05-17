import { specimen, soma } from "@vivalence/typology";
import { TurnEntity } from "@vivalence/typology/entities";
import { create } from "./scenarios/cortex.js";

// ─── helpers ──────────────────────────────────────────────────────────

async function collectStream(stream) {
  const packets = [];
  let turn = null;
  for await (const packet of stream) {
    packets.push(packet);
    turn = soma.pour(turn, packet);
  }
  return { packets, turn };
}

function captureSonnet(cortex) {
  const faculties    = cortex.table.get("dialogue");
  const sonnet       = faculties.find((faculty) => faculty.tune[0] === 0.4);
  const originalStream = sonnet.via.stream;
  let capturedTurns  = null;
  sonnet.via.stream  = async (turns, config) => {
    capturedTurns = turns;
    return originalStream(turns, config);
  };
  return {
    get turns() { return capturedTurns; },
    restore()   { sonnet.via.stream = originalStream; },
  };
}

// ─── tests ────────────────────────────────────────────────────────────

let scenario;

specimen.describe("cortex integration — CHAOSMONKEY harness", () => {

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  // ─────────────────────────────────────────────
  // 1. Thread + Turn lifecycle
  // ─────────────────────────────────────────────

  specimen.describe("thread + turn lifecycle", () => {

    specimen.it("single exchange: persists user + assistant turns", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "hello dewey" }], thread, tune: "balanced" });
      const { turn } = await collectStream(stream);

      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts[0].text).toContain("hello dewey");

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns).toHaveLength(2);
      specimen.expect(turns[0].role).toBe("user");
      specimen.expect(turns[0].parts[0].text).toBe("hello dewey");
      specimen.expect(turns[1].role).toBe("assistant");
      specimen.expect(turns[1].parts[0].text).toContain("hello dewey");
    });

    specimen.it("stream packets flow correctly: open → deltas → close", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream  = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "stream test" }], thread });
      const { packets, turn } = await collectStream(stream);

      specimen.expect(packets[0].event).toBe("/turn/open");
      specimen.expect(packets.at(-1).event).toBe("/turn/close");
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("part deltas accumulate to correct text", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream  = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "delta test" }], thread });
      const { packets, turn } = await collectStream(stream);

      const deltas = packets.filter((packet) => packet.event === "/part/delta");
      specimen.expect(deltas.length).toBeGreaterThan(0);
      specimen.expect(turn.parts[0].text).toContain("delta test");
    });

    specimen.it("parent chain: user1 ← assistant1 ← user2 ← assistant2", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream1 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "first" }], thread });
      await collectStream(stream1);

      const stream2 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "second" }], thread });
      await collectStream(stream2);

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns).toHaveLength(4);

      specimen.expect(turns[0].parent).toBeNull();
      specimen.expect(turns[1].parent?.id ?? turns[1].parent).toBe(turns[0].id);
      specimen.expect(turns[2].parent?.id ?? turns[2].parent).toBe(turns[1].id);
      specimen.expect(turns[3].parent?.id ?? turns[3].parent).toBe(turns[2].id);
    });
  });

  // ─────────────────────────────────────────────
  // 2. Multi-turn conversation
  // ─────────────────────────────────────────────

  specimen.describe("multi-turn conversation", () => {

    specimen.it("3 exchanges build linear chain of 6 turns", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      for (const text of ["one", "two", "three"]) {
        const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text }], thread });
        await collectStream(stream);
      }

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns).toHaveLength(6);

      for (let index = 0; index < 6; index++) {
        specimen.expect(turns[index].role).toBe(index % 2 === 0 ? "user" : "assistant");
      }
    });

    specimen.it("history grows: faculty receives all prior turns", async () => {
      const { dewey, createThread, cortex } = scenario;
      const thread  = await createThread();
      const capture = captureSonnet(cortex);

      try {
        const stream1 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "first" }], thread });
        await collectStream(stream1);

        const stream2 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "second" }], thread });
        await collectStream(stream2);

        specimen.expect(capture.turns).toBeDefined();
        specimen.expect(capture.turns.length).toBeGreaterThanOrEqual(4);

        const userTurns = capture.turns.filter((turn) => turn.role === "user");
        specimen.expect(userTurns).toHaveLength(2);
        specimen.expect(userTurns[0].parts[0].text).toBe("first");
        specimen.expect(userTurns[1].parts[0].text).toBe("second");
      } finally {
        capture.restore();
      }
    });
  });

  // ─────────────────────────────────────────────
  // 3. Personality (harness middleware)
  // ─────────────────────────────────────────────

  specimen.describe("personality", () => {

    specimen.it("system turn injected by mode harness middleware", async () => {
      const { dewey, createThread, cortex } = scenario;
      const thread  = await createThread();
      const capture = captureSonnet(cortex);

      try {
        const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "hi" }], thread });
        await collectStream(stream);

        specimen.expect(capture.turns).toBeDefined();
        const systemTurns = capture.turns.filter((turn) => turn.role === "system");
        specimen.expect(systemTurns.length).toBeGreaterThanOrEqual(1);
        specimen.expect(systemTurns[0].parts[0].text).toContain("Dewey");
      } finally {
        capture.restore();
      }
    });
  });

  // ─────────────────────────────────────────────
  // 4. Tune resolution
  // ─────────────────────────────────────────────

  specimen.describe("tune resolution", () => {

    specimen.it("unleashed selects opus", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "test tune" }], thread, tune: "unleashed" });
      const { turn } = await collectStream(stream);

      specimen.expect(turn.parts[0].text).toMatch(/\[opus\]/);
    });

    specimen.it("balanced selects sonnet", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "test tune" }], thread, tune: "balanced" });
      const { turn } = await collectStream(stream);

      specimen.expect(turn.parts[0].text).toMatch(/\[sonnet\]/);
    });

    specimen.it("per-exchange tune switch: frugal then unleashed", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream1 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "fast" }], thread, tune: "frugal" });
      const { turn: turn1 } = await collectStream(stream1);

      const stream2 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "powerful" }], thread, tune: "unleashed" });
      const { turn: turn2 } = await collectStream(stream2);

      specimen.expect(turn1.parts[0].text).toMatch(/\[sonnet\]/);
      specimen.expect(turn2.parts[0].text).toMatch(/\[opus\]/);
    });
  });

  // ─────────────────────────────────────────────
  // 5. Tool loop through stream
  // ─────────────────────────────────────────────

  specimen.describe("tool loop", () => {

    specimen.it("tool_use → tool_result → final turn: 3 turn cycles in stream", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({
        parts:   [{ type: "text", text: "what is casa" }],
        thread,
        tune:    "unleashed",
        tools:   { lookup: { execute: async (input) => ({ definition: `${input.query} means house` }) } },
      });
      const { packets } = await collectStream(stream);

      const opens  = packets.filter((packet) => packet.event === "/turn/open");
      const closes = packets.filter((packet) => packet.event === "/turn/close");
      specimen.expect(opens.length).toBe(3);
      specimen.expect(closes.length).toBe(3);
    });

    specimen.it("final turn of tool loop has correct content", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({
        parts:   [{ type: "text", text: "what is casa" }],
        thread,
        tune:    "unleashed",
        tools:   { lookup: { execute: async (input) => ({ definition: `${input.query} means house` }) } },
      });
      let turn = null;
      for await (const packet of stream) {
        if (packet.event === "/turn/open") turn = null;
        turn = soma.pour(turn, packet);
      }

      specimen.expect(turn.parts[0].text).toContain("casa");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("all tool loop turns persisted: user + tool_use + tool_result + final", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({
        parts:   [{ type: "text", text: "what is casa" }],
        thread,
        tune:    "unleashed",
        tools:   { lookup: { execute: async (input) => ({ definition: `${input.query} means house` }) } },
      });
      await collectStream(stream);

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns.length).toBeGreaterThanOrEqual(4);
      specimen.expect(turns[0].role).toBe("user");
    });
  });

  // ─────────────────────────────────────────────
  // 6. Persistence + rehydration
  // ─────────────────────────────────────────────

  specimen.describe("persistence", () => {

    specimen.it("turn entity shape: role, parts[], meta with stop + usage", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "shape test" }], thread });
      await collectStream(stream);

      const assistantTurn = await em.findOne(TurnEntity, { thread: thread.id, role: "assistant" });
      specimen.expect(assistantTurn).toBeDefined();
      specimen.expect(assistantTurn.parts).toBeInstanceOf(Array);
      specimen.expect(assistantTurn.parts[0].type).toBe("text");
      specimen.expect(assistantTurn.meta.stop).toBe("end_turn");
      specimen.expect(assistantTurn.meta.usage).toBeDefined();
    });

    specimen.it("rehydration: clear identity map, history still rebuilds", async () => {
      const { dewey, createThread, em, cortex } = scenario;
      const thread = await createThread();

      for (const text of ["hello", "how are you"]) {
        const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text }], thread });
        await collectStream(stream);
      }
      specimen.expect(await em.count(TurnEntity, { thread: thread.id })).toBe(4);

      em.clear();

      const capture = captureSonnet(cortex);
      try {
        const stream3 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "third after reload" }], thread });
        await collectStream(stream3);

        const userMessages = capture.turns
          .filter((turn) => turn.role === "user")
          .map((turn) => turn.parts[0].text);
        specimen.expect(userMessages).toContain("hello");
        specimen.expect(userMessages).toContain("how are you");
        specimen.expect(userMessages).toContain("third after reload");

        specimen.expect(await em.count(TurnEntity, { thread: thread.id })).toBe(6);
      } finally {
        capture.restore();
      }
    });

    specimen.it("concurrent threads are isolated", async () => {
      const { dewey, createThread, em } = scenario;
      const thread1 = await createThread();
      const thread2 = await createThread();

      const stream1 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "thread one" }], thread: thread1 });
      await collectStream(stream1);

      const stream2 = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "thread two" }], thread: thread2 });
      await collectStream(stream2);

      const turns1 = await em.find(TurnEntity, { thread: thread1.id });
      const turns2 = await em.find(TurnEntity, { thread: thread2.id });

      specimen.expect(turns1).toHaveLength(2);
      specimen.expect(turns2).toHaveLength(2);
      specimen.expect(turns1[0].parts[0].text).toBe("thread one");
      specimen.expect(turns2[0].parts[0].text).toBe("thread two");
    });

    specimen.it("empty message still creates user turn", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({ parts: [{ type: "text", text: "" }], thread });
      await collectStream(stream);

      const turns = await em.find(TurnEntity, { thread: thread.id });
      specimen.expect(turns).toHaveLength(2);
      specimen.expect(turns[0].role).toBe("user");
      specimen.expect(turns[0].parts[0].text).toBe("");
    });
  });
});
