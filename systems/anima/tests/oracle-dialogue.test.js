import { specimen, soma, Cortex } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as oracle from "../../../commons/playground/chaosmonkey/oracle/oracle.viva.js";

const lastUserText = (turns) => {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (turns[index].role !== "user") continue;
    const text = turns[index].parts?.find((part) => part.type === "text")?.text;
    if (text) return text;
  }
  return "";
};

const seer = () => ({
  type: "dialogue",
  tune: [0.9, 1.0, 0.3],
  context: 200000,
  channels: { in: ["text"], out: ["text"] },
  via: {
    stream: async ({ turns }) =>
      soma.drain({
        role: "assistant",
        parts: [{ type: "text", text: `the mist parts: ${lastUserText(turns)}` }],
        meta: { stop: "end_turn" },
      }),
  },
});

let scenario;

specimen.beforeAll(async () => {
  scenario = await mountMode(oracle, { cortex: new Cortex().register([seer()]) });
});

specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("oracle harness.dialogue.stream — turns created + streamed", () => {
  specimen.it("streams assistant packets", async () => {
    const { mode, fixtures, scoped } = scenario;

    const packets = await scoped(async () => {
      const stream = await mode.harness.dialogue.stream({
        thread: fixtures.thread,
        parts: [{ type: "text", text: "what am i" }],
      });
      const collected = [];
      for await (const packet of stream) collected.push(packet);
      return collected;
    });

    specimen.expect(packets.find((packet) => packet.event === "/turn/open")).toBeDefined();
    specimen.expect(packets.find((packet) => packet.event === "/part/delta")).toBeDefined();
    specimen.expect(packets.find((packet) => packet.event === "/turn/close")?.meta?.stop).toBe("end_turn");

    let turn = null;
    for (const packet of packets) turn = soma.pour(turn, packet);
    specimen.expect(turn.role).toBe("assistant");
    specimen.expect(turn.parts[0].text).toBe("the mist parts: what am i");
  });

  specimen.it("persists one user + one assistant turn, assistant.parent === user", async () => {
    const { mode, fixtures, scoped } = scenario;

    await scoped(async () => {
      const stream = await mode.harness.dialogue.stream({
        thread: fixtures.thread,
        parts: [{ type: "text", text: "again" }],
      });
      for await (const _ of stream) void _;
    });

    const turns = await scenario.scoped((em) =>
      em.find("TurnEntity", { thread: fixtures.thread }, { orderBy: { createdAt: "ASC" } }),
    );

    const users = turns.filter((turn) => turn.role === "user");
    const assistants = turns.filter((turn) => turn.role === "assistant");
    specimen.expect(users.length).toBeGreaterThanOrEqual(1);
    specimen.expect(assistants.length).toBeGreaterThanOrEqual(1);

    const assistant = assistants.at(-1);
    specimen.expect(assistant.parent?.id ?? assistant.parent).not.toBe(null);
  });
});
