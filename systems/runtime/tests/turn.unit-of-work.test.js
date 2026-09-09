import { specimen } from "@vivalence/typology";
import { TurnEntity } from "@vivalence/runtime";
import { create } from "./scenarios/cortex.js";

// a response is ONE unit of work. harnessed.js persists its turns on a forked em and flushes
// once at close — so a tool flushing the root em mid-response cannot carry half a response out,
// and a consumer that dies mid-stream (a runtime restart, a dropped socket) leaves the thread
// ending at the user's message, never at an unanswered tool_use.

let scenario;

const rows = (em, thread) =>
  em.fork().find(TurnEntity, { thread: thread.id }, {
    orderBy: { createdAt: "ASC" },
  });

specimen.describe("turn persistence — the response is one unit of work", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it(
    "a tool that flushes the root em mid-response does NOT persist the tool_use turn early",
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
              await ctx.daemon.entities.em.flush();
              seen.push((await rows(em, thread)).map((turn) => turn.role));
              return { definition: `${ctx.input.query} means house` };
            },
          },
        },
      });
      for await (const _ of stream);

      specimen.expect(seen).toEqual([["user"]]);
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
    "a consumer that dies after the tool_use turn sealed leaves NO response turn behind — the thread ends at the user's message",
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
      specimen.expect(after.map((turn) => turn.role)).toEqual(["user"]);
      specimen.expect(after[0].parts[0].text).toBe("what is casa");
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
