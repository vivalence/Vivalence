import { specimen, soma, v, Url, Connection, Cortex, shard, shape } from "@vivalence/typology";
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
      const hallucination = remote.hallucination({ tune: "unleashed" });
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "casa" }] });
      const turn = await hallucination.dialogue.render();
      specimen.expect(turn.parts[0].text).toMatch(/\[opus\]/);
      specimen.expect(turn.parts[0].text).toContain("casa");
    });

    specimen.it("balanced resolves sonnet (exact tune re-resolved daemon-side)", async () => {
      const hallucination = remote.hallucination({ tune: "balanced" });
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "hola" }] });
      const turn = await hallucination.dialogue.render();
      specimen.expect(turn.parts[0].text).toMatch(/\[sonnet\]/);
    });
  });

  specimen.describe("stream", () => {
    specimen.it("packets flow open → delta → close over SSE", async () => {
      const hallucination = remote.hallucination({ tune: "unleashed" });
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "flow" }] });
      const { packets, turn } = await collect(await hallucination.dialogue.stream());
      specimen.expect(packets[0].event).toBe("/turn/open");
      specimen.expect(packets.at(-1).event).toBe("/turn/close");
      specimen.expect(turn.parts[0].text).toContain("[opus] flow");
    });
  });

  specimen.describe("tool loop", () => {
    specimen.it("runs client-side: execute fires locally, only provider rounds proxy", async () => {
      let ran = false;
      const hallucination = remote.hallucination({ tune: "unleashed" });
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "what is casa" }] });
      hallucination.entities.tool.add("lookup", async (input) => {
        ran = true;
        return { message: `${input.query} means house` };
      });
      const turn = await hallucination.dialogue.render();
      specimen.expect(ran).toBe(true);
      specimen.expect(turn.parts[0].text).toContain("[opus]");
      specimen.expect(turn.meta.stop).toBe("end_turn");
    });
  });

  specimen.describe("object synthesis", () => {
    specimen.it("derivation runs client-side over a single proxied dialogue round", async () => {
      const hallucination = remote.hallucination({ tune: "unleashed" });
      hallucination.output.object(v.object({ query: v.string() }));
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "casa" }] });
      const turn = await hallucination.object.render();
      specimen.expect(turn.object).toEqual({ query: "casa" });
    });
  });
});
