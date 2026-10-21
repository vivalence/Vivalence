import { specimen } from "@vivalence/typology";
import { TurnEntity } from "@vivalence/runtime";
import stub from "../../../commons/fixtures/testing/hal/stub/provider/index.js";
import { create } from "./scenarios/cortex.js";

// m95 Q33: harnessed.js creates each turn's row at /turn/open on a forked em and saves it at its
// /turn/close — a tool running mid-response already reads the sealed tool_use turn, and a consumer
// that dies after a seal (a runtime restart, a dropped socket) keeps every turn closed so far.

let scenario;

const rows = (em, thread) =>
  em.fork().find(TurnEntity, { thread: thread.id }, {
    orderBy: { createdAt: "ASC" },
  });

specimen.describe("turn persistence — each turn is saved at its close (m95 Q33)", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it(
    "a tool running mid-response reads the tool_use turn already saved at its close",
    async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();
      const seen = [];

      const stream = await dewey.harness.dialogue.stream({
        parts: [{ type: "text", text: "what is casa" }],
        thread,
        tune: "unleashed",
        tools: {
          lookup: {
            execute: async (ctx) => {
              await ctx.entities.em.flush();
              seen.push((await rows(em, thread)).map((turn) => turn.role));
              return { definition: `${ctx.input.query} means house` };
            },
          },
        },
      });
      for await (const _ of stream);

      specimen.expect(seen).toEqual([["user", "assistant"]]);
      const after = await rows(em, thread);
      specimen.expect(after.map((turn) => turn.role)).toEqual([
        "user",
        "assistant",
        "user",
        "assistant",
      ]);
      specimen.expect(after[1].parts.some((part) => part.type === "tool_use"))
        .toBe(true);
      specimen.expect(
        after[2].parts.some((part) => part.type === "tool_result"),
      ).toBe(true);
    },
  );

  specimen.it(
    "a consumer that dies after the tool_use turn sealed keeps that turn — the thread ends at the tool_use",
    async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({
        parts: [{ type: "text", text: "what is casa" }],
        thread,
        tune: "unleashed",
        tools: {
          lookup: {
            execute: async (ctx) => ({
              definition: `${ctx.input.query} means house`,
            }),
          },
        },
      });
      for await (const packet of stream) {
        if (packet.event === "/turn/close") break;
      }

      const after = await rows(em, thread);
      specimen.expect(after.map((turn) => turn.role)).toEqual(["user", "assistant"]);
      specimen.expect(after[0].parts[0].text).toBe("what is casa");
      specimen.expect(after[1].parts.some((part) => part.type === "tool_use")).toBe(true);
      specimen.expect(after[1].parent?.id ?? after[1].parent).toBe(after[0].id);
    },
  );

  specimen.it(
    "a whole response lands at close — user + tool_use + tool_result + final, chained by parent",
    async () => {
      const { dewey, createThread, em } = scenario;
      const thread = await createThread();

      const stream = await dewey.harness.dialogue.stream({
        parts: [{ type: "text", text: "what is casa" }],
        thread,
        tune: "unleashed",
        tools: {
          lookup: {
            execute: async (ctx) => ({
              definition: `${ctx.input.query} means house`,
            }),
          },
        },
      });
      for await (const _ of stream);

      const after = await rows(em, thread);
      specimen.expect(after).toHaveLength(4);
      for (let i = 1; i < after.length; i++) {
        specimen.expect(after[i].parent?.id ?? after[i].parent).toBe(
          after[i - 1].id,
        );
      }
    },
  );
});

// a response that closes without an answer is still a response: the close's verdict — state,
// rounds, the fault — lands on an assistant turn, so the thread and the dock can say WHY there
// is nothing to read. 09-23: gpt-5.1 answered `hi` with finish_reason length and zero parts; the
// turn persisted empty, the dock drew nothing.
specimen.describe("turn persistence — a response with no answer persists its verdict", () => {
  let world;
  specimen.beforeAll(async () => {
    world = await create();
    world.cortex.faculties.clear();
    world.cortex.register(await stub({ statics: {} }));
  });
  specimen.afterAll(async () => {
    await world.daemon.entities.activity.remove({});
    await world.orm.close();
  });

  const answer = async (text, config) => {
    const thread = await world.createThread();
    const stream = await world.dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text }], ...(config && { config }) });
    for await (const _ of stream);
    return rows(world.em, thread);
  };

  specimen.it("a provider close with no parts (length) keeps its empty assistant turn, the response's rounds folded into its meta", async () => {
    const after = await answer("hi --close length");
    specimen.expect(after.map((turn) => turn.role)).toEqual(["user", "assistant"]);
    specimen.expect(after[1].parts).toEqual([]);
    specimen.expect(after[1].meta).toMatchObject({ state: "length", rounds: 1, provider: { finish_reason: "length" } });
  });

  specimen.it("a fatal fault before any turn opened mints the assistant turn the provider never did — state error, the fault's message on it", async () => {
    const after = await answer("hi --fault", { backoff: [] });
    specimen.expect(after.map((turn) => turn.role)).toEqual(["user", "assistant"]);
    specimen.expect(after[1].parts).toEqual([]);
    specimen.expect(after[1].meta).toMatchObject({ state: "error", rounds: 1, fault: { kind: "unknown", message: "[stub] scripted fatal fault" } });
    specimen.expect(after[1].parent?.id ?? after[1].parent).toBe(after[0].id);
  });
});
