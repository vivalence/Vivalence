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

function parseSSEFrames(text) {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((frame) => {
      const data = frame.replace(/^data: /, "");
      try { return JSON.parse(data); }
      catch { return data; }
    });
}


function captureSonnet(cortex) {
  const faculties = cortex.table.get("conversation");
  const sonnet = faculties.find((faculty) => faculty.tune[0] === 0.4);
  const originalStream = sonnet.via.stream;
  let capturedTurns = null;
  sonnet.via.stream = async (turns, config) => {
    capturedTurns = turns;
    return originalStream(turns, config);
  };
  return {
    get turns() { return capturedTurns; },
    restore() { sonnet.via.stream = originalStream; },
  };
}

// ─── tests ────────────────────────────────────────────────────────────

let scenario;

specimen.describe("cortex integration — CONVERSATIONAL trait", () => {

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

      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: "hello dewey",
      });
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

      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: "stream test",
      });
      const { packets, turn } = await collectStream(stream);

      specimen.expect(packets[0].event).toBe("turn.open");
      specimen.expect(packets.at(-1).event).toBe("turn.close");
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });

    specimen.it("parent chain: user1 ← assistant1 ← user2 ← assistant2", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream1 = await dewey.dialogue.chat({ thread: thread.id, message: "first" });
      await collectStream(stream1);

      const stream2 = await dewey.dialogue.chat({ thread: thread.id, message: "second" });
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

      for (const message of ["one", "two", "three"]) {
        const stream = await dewey.dialogue.chat({ thread: thread.id, message });
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
      const thread = await createThread();
      const capture = captureSonnet(cortex);

      try {
        const stream1 = await dewey.dialogue.chat({ thread: thread.id, message: "first" });
        await collectStream(stream1);

        const stream2 = await dewey.dialogue.chat({ thread: thread.id, message: "second" });
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
  // 3. Personality (dialogue vector effect)
  // ─────────────────────────────────────────────

  specimen.describe("dialogue vector", () => {

    specimen.it("personality system turn is injected by dialogue effect", async () => {
      const { dewey, createThread, cortex } = scenario;
      const thread = await createThread();
      const capture = captureSonnet(cortex);

      try {
        const stream = await dewey.dialogue.chat({ thread: thread.id, message: "hi" });
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

      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: "test tune",
        tune: "unleashed",
      });
      const { turn } = await collectStream(stream);

      specimen.expect(turn.parts[0].text).toMatch(/\[opus\]/);
    });

    specimen.it("default mode tune balanced selects sonnet", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: "test tune",
      });
      const { turn } = await collectStream(stream);

      specimen.expect(turn.parts[0].text).toMatch(/\[sonnet\]/);
    });

    specimen.it("per-exchange tune switch: frugal then unleashed", async () => {
      const { dewey, createThread } = scenario;
      const thread = await createThread();

      const stream1 = await dewey.dialogue.chat({
        thread: thread.id,
        message: "fast",
        tune: "frugal",
      });
      const { turn: turn1 } = await collectStream(stream1);

      const stream2 = await dewey.dialogue.chat({
        thread: thread.id,
        message: "powerful",
        tune: "unleashed",
      });
      const { turn: turn2 } = await collectStream(stream2);

      // frugal can't use haiku (render-only), picks sonnet as nearest streamable
      specimen.expect(turn1.parts[0].text).toMatch(/\[sonnet\]/);
      specimen.expect(turn2.parts[0].text).toMatch(/\[opus\]/);
    });
  });

  // ─────────────────────────────────────────────
  // 5. Tool loop through stream
  // ─────────────────────────────────────────────

  specimen.describe("tool loop", () => {

    specimen.it("tool_use → tool_result → final turn, all persisted", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: "what is casa",
        tune: "unleashed",
        tools: {
          lookup: {
            execute: async (input) => ({ definition: `${input.query} means house` }),
          },
        },
      });
      const { packets, turn: finalTurn } = await collectStream(stream);

      specimen.expect(finalTurn.meta.stop).toBe("end_turn");
      specimen.expect(finalTurn.parts[0].text).toContain("casa");

      // Multiple turn.open/turn.close cycles from tool loop
      const turnOpens = packets.filter((packet) => packet.event === "turn.open");
      const turnCloses = packets.filter((packet) => packet.event === "turn.close");
      specimen.expect(turnOpens.length).toBeGreaterThanOrEqual(2);
      specimen.expect(turnCloses.length).toBeGreaterThanOrEqual(2);

      // Persistence: user + assistant(tool_use) + user(tool_result) + assistant(final)
      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ─────────────────────────────────────────────
  // 6. Persistence + rehydration
  // ─────────────────────────────────────────────

  specimen.describe("persistence", () => {

    specimen.it("turn entity shape: role, parts[], meta with stop + usage", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.dialogue.chat({ thread: thread.id, message: "shape test" });
      await collectStream(stream);

      const assistantTurn = await em.findOne(TurnEntity, { thread: thread.id, role: "assistant" });
      specimen.expect(assistantTurn).toBeDefined();
      specimen.expect(assistantTurn.role).toBe("assistant");
      specimen.expect(assistantTurn.parts).toBeInstanceOf(Array);
      specimen.expect(assistantTurn.parts[0].type).toBe("text");
      specimen.expect(assistantTurn.meta).toBeDefined();
      specimen.expect(assistantTurn.meta.stop).toBe("end_turn");
      specimen.expect(assistantTurn.meta.usage).toBeDefined();
    });

    specimen.it("rehydration: clear identity map, continue from DB", async () => {
      const { dewey, createThread, em, cortex } = scenario;
      const thread = await createThread();

      for (const message of ["hello", "how are you"]) {
        const stream = await dewey.dialogue.chat({ thread: thread.id, message });
        await collectStream(stream);
      }

      specimen.expect(await em.count(TurnEntity, { thread: thread.id })).toBe(4);

      em.clear();

      const capture = captureSonnet(cortex);

      try {
        const stream3 = await dewey.dialogue.chat({ thread: thread.id, message: "third after reload" });
        await collectStream(stream3);

        specimen.expect(capture.turns).toBeDefined();
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

      const stream1 = await dewey.dialogue.chat({ thread: thread1.id, message: "thread one" });
      await collectStream(stream1);

      const stream2 = await dewey.dialogue.chat({ thread: thread2.id, message: "thread two" });
      await collectStream(stream2);

      const turns1 = await em.find(TurnEntity, { thread: thread1.id });
      const turns2 = await em.find(TurnEntity, { thread: thread2.id });

      specimen.expect(turns1).toHaveLength(2);
      specimen.expect(turns2).toHaveLength(2);

      specimen.expect(turns1[0].parts[0].text).toBe("thread one");
      specimen.expect(turns2[0].parts[0].text).toBe("thread two");
    });
  });

  // ─────────────────────────────────────────────
  // 7. Edge cases
  // ─────────────────────────────────────────────

  specimen.describe("edge cases", () => {

    specimen.it("empty message still creates user turn", async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.dialogue.chat({ thread: thread.id, message: "" });
      await collectStream(stream);

      const turns = await em.find(TurnEntity, { thread: thread.id });
      specimen.expect(turns).toHaveLength(2);
      specimen.expect(turns[0].role).toBe("user");
      specimen.expect(turns[0].parts[0].text).toBe("");
    });
  });

  // ─────────────────────────────────────────────
  // 8. HTTP/SSE transport
  // ─────────────────────────────────────────────

  specimen.describe("HTTP/SSE transport", () => {

    const dialoguePath = "/mode/teacher/dewey/dialogue/chat";

    specimen.it("POST /dialogue/chat returns text/event-stream", async () => {
      const { connection, createThread } = scenario;
      const thread = await createThread();

      const response = await connection.fetch(dialoguePath, {
        thread: thread.id, message: "oi dewey",
      });

      specimen.expect(response.status).toBe(200);
      specimen.expect(response.headers.get("content-type")).toBe("text/event-stream");
    });

    specimen.it("SSE frames contain well-formed turn lifecycle", async () => {
      const { connection, createThread } = scenario;
      const thread = await createThread();

      const text = await connection.call(dialoguePath, {
        thread: thread.id, message: "como vai",
      });
      const frames = parseSSEFrames(text);

      specimen.expect(frames[0].event).toBe("turn.open");
      specimen.expect(frames.at(-1).event).toBe("turn.close");

      const deltas = frames.filter((frame) => frame.event === "part.delta");
      specimen.expect(deltas.length).toBeGreaterThan(0);
    });

    specimen.it("turns persisted after SSE stream consumed", async () => {
      const { connection, createThread, em } = scenario;
      const thread = await createThread();

      await connection.call(dialoguePath, {
        thread: thread.id, message: "tudo bem",
      });

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns).toHaveLength(2);
      specimen.expect(turns[0].role).toBe("user");
      specimen.expect(turns[1].role).toBe("assistant");
    });

    specimen.it("multi-turn over HTTP preserves history", async () => {
      const { connection, createThread, em } = scenario;
      const thread = await createThread();

      await connection.call(dialoguePath, { thread: thread.id, message: "primeiro" });
      await connection.call(dialoguePath, { thread: thread.id, message: "segundo" });

      const turns = await em.find(TurnEntity, { thread: thread.id }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(turns).toHaveLength(4);
      specimen.expect(turns[0].parts[0].text).toBe("primeiro");
      specimen.expect(turns[2].parts[0].text).toBe("segundo");
    });

    specimen.it("tune override works over HTTP", async () => {
      const { connection, createThread } = scenario;
      const thread = await createThread();

      const text = await connection.call(dialoguePath, {
        thread: thread.id, message: "test tune", tune: "unleashed",
      });
      const frames = parseSSEFrames(text);

      const textDeltas = frames
        .filter((frame) => frame.event === "part.delta")
        .map((frame) => frame.delta?.text ?? "")
        .join("");

      specimen.expect(textDeltas).toMatch(/\[opus\]/);
    });
  });
});
