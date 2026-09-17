import { specimen, shape, soma, Cortex } from "@vivalence/typology";
import { mountMode } from "@vivalence/runtime/scenarios";
import * as oracle from "../../../commons/playground/chaosmonkey/oracle/oracle.viva.js";

const seer = () => ({
  type: "dialogue",
  tune: [0.9, 1.0, 0.3],
  context: 200000,
  channels: { in: ["text"], out: ["text"] },
  via: {
    stream: async () =>
      soma.drain({
        role: "assistant",
        parts: [{ type: "text", text: "the mist parts" }],
        meta: { stop: "end_turn" },
      }),
  },
});

let scenario;
const MOUNT = "/mode/chaosmonkey/oracle";

specimen.beforeAll(async () => {
  scenario = await mountMode(oracle, { cortex: new Cortex().register([seer()]) });
});
specimen.afterAll(async () => {
  await scenario.orm.close();
});

// The wired client namespace (shape.connection.wire over metadata) — NOT the local
// shape.object the server holds. Guards the two bugs that kept the dock on "awaiting
// handshake": (1) stream leaves must carry `yields` so wire projects connection.stream
// not a buffered .call; (2) /metadata/harness must strip the mounted /harness branch.
specimen.describe("client harness wire — mode.harness.dialogue.stream streams over the wire", () => {
  specimen.it("the stream leaf carries yields in the harness strip", () => {
    const strip = shape.strip(scenario.mode.aperture.branch("/harness"));
    const streamLeaf = strip.branches.dialogue.branches.stream;
    specimen.expect(streamLeaf.effect?.yields).not.toBe(undefined);
  });

  specimen.it("wire projects an async-iterable that yields parsed packets", async () => {
    const metadata = shape.strip(scenario.mode.aperture.branch("/harness"));
    const harness = shape.connection.wire(scenario.authedConn.branch(`${MOUNT}/harness`), metadata);

    const packets = await scenario.scoped(async () => {
      const stream = harness.dialogue.stream({
        thread: scenario.fixtures.thread.id,
        parts: [{ type: "text", text: "what am i" }],
      });
      specimen.expect(!!stream?.[Symbol.asyncIterator]).toBe(true);
      const collected = [];
      for await (const packet of stream) collected.push(packet);
      return collected;
    });

    specimen.expect(packets.find((p) => p.event === "/turn/open")).toBeDefined();
    specimen.expect(packets.find((p) => p.event === "/part/delta")).toBeDefined();
    specimen.expect(packets.find((p) => p.event === "/turn/close")).toBeDefined();

    let turn = null;
    for (const packet of packets) turn = soma.pour(turn, packet);
    specimen.expect(turn.parts[0].text).toBe("the mist parts");
  });

  specimen.it("persists user + assistant turns through the streamed wire path", async () => {
    const metadata = shape.strip(scenario.mode.aperture.branch("/harness"));
    const harness = shape.connection.wire(scenario.authedConn.branch(`${MOUNT}/harness`), metadata);

    await scenario.scoped(async () => {
      const stream = harness.dialogue.stream({
        thread: scenario.fixtures.thread.id,
        parts: [{ type: "text", text: "again" }],
      });
      for await (const _ of stream) void _;
    });

    const turns = await scenario.scoped((em) =>
      em.find("TurnEntity", { thread: scenario.fixtures.thread.id }, { orderBy: { createdAt: "ASC" } }),
    );
    specimen.expect(turns.filter((t) => t.role === "user").length).toBeGreaterThanOrEqual(1);
    specimen.expect(turns.filter((t) => t.role === "assistant").length).toBeGreaterThanOrEqual(1);
  });
});
