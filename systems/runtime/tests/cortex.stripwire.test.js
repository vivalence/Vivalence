import { specimen, soma, v, Url, Connection, Cortex, Vector, shard, shape } from "@vivalence/typology";
import { cortex as mountCortex } from "@vivalence/runtime/daemon/aperture";
import { create } from "./scenarios/cortex.js";

async function collect(stream) {
  const packets = [];
  let turn = null;
  for await (const packet of stream) {
    packets.push(packet);
    if (packet.event === "/turn/open") turn = null;
    turn = soma.pour(turn, packet);
  }
  return { packets, turn };
}

let scenario;
let remote;

specimen.describe("cortex stripwire — remote Cortex over a Connection", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
    const { daemon } = scenario;

    mountCortex({ good: daemon });
    daemon.aperture.branch("/metadata").open("/cortex", () => shape.cortex.strip(daemon.cortex));

    const connection = new Connection(
      new Url("http://test"),
      shard.transmitter.inline(shape.http(daemon.aperture)),
    );
    const strip = await connection.call("/metadata/cortex");
    remote = new Cortex().register(shape.cortex.wire(connection.branch("/cortex"), strip));
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("mirrors the faculty strip: three dialogue faculties, via keys", () => {
    const dialogue = remote.find({ type: "dialogue" });
    specimen.expect(dialogue).toHaveLength(3);
    specimen.expect(Object.keys(dialogue[0].via).sort()).toEqual(["render", "stream"]);
  });

  specimen.describe("render", () => {
    specimen.it("unleashed resolves opus through the wire", async () => {
      const folded = await remote.hallucinate.dialogue.render({
        policy: { tune: "unleashed" },
        turns: [{ role: "user", parts: [{ type: "text", text: "casa" }] }],
      });
      specimen.expect(folded.output.message).toMatch(/\[opus\]/);
      specimen.expect(folded.output.message).toContain("casa");
    });

    specimen.it("balanced resolves sonnet (exact tune re-resolved daemon-side)", async () => {
      const folded = await remote.hallucinate.dialogue.render({
        policy: { tune: "balanced" },
        turns: [{ role: "user", parts: [{ type: "text", text: "hola" }] }],
      });
      specimen.expect(folded.output.message).toMatch(/\[sonnet\]/);
    });
  });

  specimen.describe("stream", () => {
    specimen.it("packets flow open → close, session sealed over SSE", async () => {
      const { packets, turn } = await collect(
        await remote.hallucinate.dialogue.stream({
          policy: { tune: "unleashed" },
          turns: [{ role: "user", parts: [{ type: "text", text: "flow" }] }],
        }),
      );
      specimen.expect(packets[0].event).toBe("/turn/open");
      specimen.expect(packets.at(-1).event).toBe("/response/close");
      specimen.expect(turn.parts[0].text).toContain("[opus] flow");
    });
  });

  specimen.describe("tool loop", () => {
    specimen.it("runs client-side: execute fires locally, only provider rounds proxy", async () => {
      let ran = false;
      const tools = new Vector().open({ nature: "lookup" }, async (ctx) => {
        ran = true;
        return { message: `${ctx.input.query} means house` };
      });
      const folded = await remote.hallucinate.dialogue.render({
        policy: { tune: "unleashed" },
        turns: [{ role: "user", parts: [{ type: "text", text: "what is casa" }] }],
        tools,
      });
      specimen.expect(ran).toBe(true);
      specimen.expect(folded.output.message).toContain("[opus]");
      specimen.expect(folded.meta.state).toBe("complete");
    });
  });

  specimen.describe("object synthesis", () => {
    specimen.it("derivation runs client-side over a single proxied dialogue round", async () => {
      const folded = await remote.hallucinate.object.render({
        policy: { tune: "unleashed" },
        turns: [{ role: "user", parts: [{ type: "text", text: "casa" }] }],
        output: { schema: v.object({ query: v.string() }) },
      });
      specimen.expect(folded.output.object).toEqual({ query: "casa" });
    });
  });
});
