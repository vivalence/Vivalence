import { join } from "@std/path";
import { specimen, v, Url, Connection, Cortex, Aperture, shard, shape } from "@vivalence/typology";
import { cortex as mountCortex } from "@vivalence/runtime/daemon/aperture";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
}

const answered = (turns) => turns.at(-1)?.parts?.some((part) => part.type === "tool_result");

function contractFaculty() {
  return {
    type: "dialogue",
    tune: [0.9, 1.0, 0.3],
    context: 200000,
    channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
    via: {
      render: async (request) => {
        if (request.tools && !answered(request.turns)) {
          return {
            role: "assistant",
            parts: [
              {
                type: "tool_use",
                id: "call-1",
                name: "lookup",
                input: { query: "casa" },
              },
            ],
            meta: { state: "tools" },
          };
        }
        return {
          role: "assistant",
          parts: [{ type: "text", text: "casa means house" }],
          meta: { state: "complete" },
        };
      },
    },
  };
}

specimen.describe("cortex contract snapshot — what actually crosses the daemon wire", () => {
  let exchanges;
  let strip;
  let sealed;

  specimen.beforeAll(async () => {
    const daemon = { aperture: new Aperture(), cortex: new Cortex().register([contractFaculty()]) };
    mountCortex({ good: daemon });
    daemon.aperture.branch("/metadata").open("/cortex", () => shape.cortex.strip(daemon.cortex));

    const handler = shape.http(daemon.aperture);
    exchanges = [];
    const recordingHandler = async (request) => {
      const text = await request.clone().text();
      exchanges.push({
        method: request.method,
        pathname: new URL(request.url).pathname,
        body: text ? JSON.parse(text) : null,
      });
      return handler(request);
    };

    const connection = new Connection(
      new Url("http://test"),
      shard.transmitter.inline(recordingHandler),
    );
    strip = await connection.call("/metadata/cortex");
    const remote = new Cortex().register(shape.cortex.wire(connection.branch("/cortex"), strip));

    const hallucination = remote.hallucination({
      tune: "unleashed",
      settings: { temperature: 0, maxTokens: 128 },
      output: { object: v.object({ verdict: v.string() }) },
    });
    hallucination.context.system("You are the wire contract pin.");
    hallucination.tools.open(
      { nature: "lookup" },
      async (ctx) => ({ message: `${ctx.input.query} means house` }),
    );
    hallucination.tools.open(
      { nature: "grade", valence: "grades an answer", input: v.object({ score: v.number() }) },
      async () => ({ message: "graded" }),
    );
    hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: "casa" }] });
    sealed = await hallucination.dialogue.render();
  });

  specimen.it("the /metadata/cortex strip payload", () => {
    pin(strip, "cortex-contract-strip.snapshot.json");
  });

  specimen.it("the /cortex/render rounds: tools cross stripped of execute, settings + output ride", () => {
    const rounds = exchanges.filter((exchange) => exchange.pathname === "/cortex/render");
    specimen.expect(rounds).toHaveLength(2);
    specimen.expect(rounds[0].body.request.tools.find((tool) => tool.name === "lookup")).toEqual({ name: "lookup" });
    specimen.expect(rounds[0].body.request.tools.find((tool) => tool.name === "grade").execute).toBe(undefined);
    specimen.expect(sealed.message).toBe("casa means house");
    pin(rounds, "cortex-contract-render.snapshot.json");
  });
});
