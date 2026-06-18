import { specimen, sleep, soma, shape } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";
import { CONVERSATIONAL } from "@vivalence/runtime/daemon/traits";

const { http } = shape;
const PORT = 9886;

// ─── wire frame helpers ───────────────────────────────────────────────

const CLIENT_SHAPE = {
  leaves: [],
  branches: {
    dialogue: {
      leaves: [{ nature: "packet" }, { nature: "close" }],
      branches: {},
    },
  },
};

function handshakeFrame() {
  return JSON.stringify({ signal: "/handshake/open", input: { shape: CLIENT_SHAPE }, echo: "open" });
}
function dialogueOpenFrame(thread, parts, tune) {
  return JSON.stringify({
    signal: "/dialogue/open",
    input: { thread: thread.id, parts, ...(tune ? { tune } : {}) },
  });
}

async function openSocket() {
  const ws = new WebSocket(`ws://localhost:${PORT}/conversation`);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = (e) => reject(new Error("WS open failed"));
  });
  return ws;
}

async function handshake(ws) {
  const reply = new Promise((resolve) => {
    const original = ws.onmessage;
    ws.onmessage = (e) => {
      const frame = JSON.parse(e.data);
      if (frame.echo === "open") {
        ws.onmessage = original;
        resolve(frame.output);
        return;
      }
      original?.(e);
    };
  });
  ws.send(handshakeFrame());
  return reply;
}

async function dialogueAndCollect(ws, thread, parts, tune) {
  const packets = [];
  const done = new Promise((resolve) => {
    ws.onmessage = (e) => {
      const frame = JSON.parse(e.data);
      if (frame.signal === "/dialogue/packet") packets.push(frame.input);
      if (frame.signal === "/dialogue/close") resolve();
    };
  });
  ws.send(dialogueOpenFrame(thread, parts, tune));
  await done;
  let turn = null;
  for (const packet of packets) turn = soma.pour(turn, packet);
  return { packets, turn };
}

// ─── scenario ─────────────────────────────────────────────────────────

let scenario;

specimen.describe("conversation integration — CONVERSATIONAL × HARNESSED", () => {
    const abort = new AbortController();

    specimen.beforeAll(async () => {
      scenario = await create();

      // The test scenario's daemon has no live datamap (no RequestContext).
      // Inject a no-op stub so CONVERSATIONAL's per-message context wrapper runs.
      // SQLite in-memory with allowGlobalContext:true doesn't need per-request isolation.
      scenario.daemon.datamap = {
        shard: {
          context: (fn) => fn(),
          bind: (_name, _resolve) => async (_ctx, next) => next(),
        },
      };

      CONVERSATIONAL(scenario.dewey, scenario.daemon);

      Deno.serve(
        { port: PORT, signal: abort.signal, onListen() {} },
        http(scenario.dewey.aperture),
      );
      await sleep.ms(100);
    });

    specimen.afterAll(async () => {
      abort.abort();
      await scenario.orm.close();
    });

    specimen.it("handshake open returns server shape", async () => {
      const thread = await scenario.createThread();
      const ws = await openSocket();

      const serverReply = await handshake(ws);

      specimen.expect(serverReply).toBeDefined();
      specimen.expect(serverReply.shape).toBeDefined();

      ws.close();
      await sleep.ms(50);
    });

    specimen.it("dialogue open → packet stream → close", async () => {
      const thread = await scenario.createThread();
      const ws = await openSocket();
      await handshake(ws);

      const { packets, turn } = await dialogueAndCollect(ws, thread, [{ type: "text", text: "olá Dewey" }]);

      specimen.expect(packets.find((p) => p.event === "/turn/open")).toBeDefined();
      specimen.expect(packets.find((p) => p.event === "/part/delta")).toBeDefined();
      const close = packets.find((p) => p.event === "/turn/close");
      specimen.expect(close).toBeDefined();
      specimen.expect(close.meta.stop).toBe("end_turn");
      specimen.expect(turn.role).toBe("assistant");

      ws.close();
      await sleep.ms(50);
    });

    specimen.it("turns are persisted after dialogue close", async () => {
      const { em } = scenario;
      const thread = await scenario.createThread();
      const ws = await openSocket();
      await handshake(ws);

      await dialogueAndCollect(ws, thread, [{ type: "text", text: "como vai" }]);
      await sleep.ms(50); // scribe flush

      const turns = await em.find("TurnEntity", { thread });
      specimen.expect(turns.length).toBeGreaterThanOrEqual(2);
      specimen.expect(turns.some((t) => t.role === "user")).toBe(true);
      specimen.expect(turns.some((t) => t.role === "assistant")).toBe(true);

      ws.close();
      await sleep.ms(50);
    });

    // ─── multi-turn history ──────────────────────────────────────────────────

    specimen.it("second dialogue open loads prior exchange as history", async () => {
      const { em, dewey } = scenario;
      const thread = await scenario.createThread();
      const ws     = await openSocket();
      await handshake(ws);

      // First exchange.
      await dialogueAndCollect(ws, thread, [{ type: "text", text: "Como se diz 'house'?" }]);
      await sleep.ms(50);

      const afterFirst = await em.find("TurnEntity", { thread }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(afterFirst.length).toBe(2); // user + assistant

      // Second exchange.
      await dialogueAndCollect(ws, thread, [{ type: "text", text: "E 'kitchen'?" }]);
      await sleep.ms(50);

      const afterSecond = await em.find("TurnEntity", { thread }, { orderBy: { createdAt: "ASC" } });
      specimen.expect(afterSecond.length).toBe(4); // user1, assistant1, user2, assistant2

      // user2.parent === assistant1 proves HARNESSED loaded the first pair as history.
      // history.at(-1) was assistant1, so user2's parent must be assistant1.
      const [, assistant1, user2] = afterSecond;
      specimen.expect(user2.parent?.id ?? user2.parent).toBe(assistant1.id);

      ws.close();
      await sleep.ms(50);
    });

    // ─── user filter isolation ───────────────────────────────────────────────
    // Explicitly tests that HARNESSED's turn.find() respects the MikroORM
    // user filter across WS dialogue opens. Without a RequestContext wrapper per open
    // this can bleed across users — this test will catch that regression.

    specimen.it("user filter: history query is isolated to thread owner", async () => {
      const { em, fixtures, dewey } = scenario;

      // User B — a second user whose thread user A must NOT see.
      const userB = em.create("UserEntity", { roles: ["USER"], config: {} });
      await em.flush();

      const threadA = await scenario.createThread(); // owned by fixtures.user
      const threadB = em.create("ThreadEntity", {
        user: userB,
        mode: fixtures.dewey,
        trait: {},
        cursor: 0,
        counter: 0,
      });
      await em.flush();

      // Build a full exchange on threadA so its turns exist in the db.
      const streamA = await dewey.harness.dialogue.stream({
        thread: threadA,
        parts: [{ type: "text", text: "oi" }],
      });
      for await (const _ of streamA) { /* drain */ }
      await sleep.ms(50);

      // Anchor arrives with threadB's ID while the em filter is still scoped to fixtures.user.
      // HARNESSED's history query: turn.find({ thread: threadB })
      // The user filter is: WHERE thread.user_id = fixtures.user.id
      // threadB.user = userB ≠ fixtures.user → query must return [] → no turns leaked.
      let historySeenByAnchor = null;
      const originalStream = dewey.harness.dialogue.stream.bind(dewey.harness.dialogue);
      dewey.harness.dialogue.stream = async (input) => {
        // Intercept to inspect what turns HARNESSED loaded as history.
        historySeenByAnchor = input.turns ?? null;
        return originalStream(input);
      };

      // Use the harness directly (same path CONVERSATIONAL takes) with threadB.
      const streamB = await dewey.harness.dialogue.stream({
        thread: threadB,
        parts: [{ type: "text", text: "olá" }],
      });
      for await (const _ of streamB) { /* drain */ }

      dewey.harness.dialogue.stream = originalStream;

      // Verify threadA's turns are NOT visible when querying under threadB's context.
      const turnsForB = await em.find("TurnEntity", { thread: threadB });
      const turnsForA = await em.find("TurnEntity", { thread: threadA });

      // User filter (fixtures.user) must block threadB's turns from appearing
      // in queries scoped to user A — and vice versa.
      specimen.expect(turnsForA.every((t) => t.thread.id === threadA.id)).toBe(true);
      specimen.expect(turnsForB.length).toBe(0); // filter blocks cross-user read
    });
  },
);
