import { join } from "@std/path";
import { specimen, v, Cortex, Hallucination, Vector } from "@vivalence/typology";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
}

const Verdict = v.object({ verdict: v.string(), grade: v.number({ default: 0.5 }) });
const LookupInput = v.object({ query: v.string() });

function userTurn(text) {
  return { role: "user", parts: [{ type: "text", text }] };
}

function sealedTurn(text) {
  return { role: "assistant", parts: [{ type: "text", text }], meta: { state: "complete" } };
}

function scriptedCortex(script, seen) {
  let cursor = 0;
  return new Cortex().register([
    {
      type: "dialogue",
      tune: [0.5, 0.5, 0.5],
      channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
      via: {
        render: async (request) => {
          seen.push(request);
          return script[cursor++];
        },
      },
    },
  ]);
}

specimen.describe("hallucination snapshot — the compiled response contract, pinned as-is", () => {
  specimen.describe("request compilation", () => {
    specimen.it(
      "system sections + tool declarations + cache marks + settings + output cross lowered",
      async () => {
        const seen = [];
        const tools = new Vector()
          .open({ nature: "bare" }, async () => "bare ran")
          .open(
            { nature: "dressed", valence: "looks up a word", input: LookupInput },
            async () => "dressed ran",
          );
        await Hallucination(scriptedCortex([sealedTurn("sealed")], seen)).dialogue.render({
          system: { persona: "You are the request pin.", language: "pt-BR" },
          turns: [userTurn("primeira"), { role: "assistant", parts: [{ type: "text", text: "resposta" }] }],
          tools,
          settings: { temperature: 0, maxTokens: 128 },
          output: { schema: Verdict },
        });

        pin(seen[0], "hallucination-request.snapshot.json");
      },
    );

    specimen.it(
      "declarations carry valence + input only — never an execute closure (the wire law)",
      async () => {
        const seen = [];
        const tools = new Vector()
          .open({ nature: "bare" }, async () => "bare ran")
          .open(
            { nature: "dressed", valence: "looks up a word", input: LookupInput },
            async () => "dressed ran",
          );
        await Hallucination(scriptedCortex([sealedTurn("sealed")], seen)).dialogue.render({
          turns: [userTurn("casa")],
          tools,
        });

        specimen.expect(seen[0].tools.find((tool) => tool.name === "bare")).toEqual({ name: "bare" });
        specimen.expect(seen[0].tools.find((tool) => tool.name === "dressed").execute).toBe(undefined);
        specimen.expect(seen[0].cache).toEqual({ marks: ["tools"] });
        pin(seen[0], "hallucination-declarations.snapshot.json");
      },
    );

    specimen.it("an invalid policy throws at the call, named", async () => {
      let error = null;
      try {
        await Hallucination(new Cortex()).dialogue.render({ policy: { rounds: 0 }, turns: [] });
      } catch (thrown) { error = thrown; }
      specimen.expect(error.message).toContain("invalid policy");
    });
  });

  specimen.describe("tool loop", () => {
    specimen.it(
      "multi-round transcript: input variants + yield-channel packing folded into the yield",
      async () => {
        const seen = [];
        const cortex = scriptedCortex(
          [
            {
              role: "assistant",
              parts: [
                { type: "tool_use", id: "use-1", name: "reflect", input: { query: "casa" } },
                { type: "tool_use", id: "use-4", name: "phantom", input: { ignored: true } },
              ],
              meta: { state: "tools" },
            },
            {
              role: "assistant",
              parts: [
                { type: "tool_use", id: "use-5", name: "plainString", input: {} },
                { type: "tool_use", id: "use-6", name: "messageChannel", input: {} },
                { type: "tool_use", id: "use-7", name: "entitiesChannel", input: {} },
                { type: "tool_use", id: "use-8", name: "objectChannel", input: {} },
              ],
              meta: { state: "tools" },
            },
            sealedTurn("all channels covered"),
          ],
          seen,
        );

        const tools = new Vector()
          .open({ nature: "reflect" }, async (ctx) => ({ message: ctx.input }))
          .open({ nature: "plainString" }, async () => "a bare string reply")
          .open({ nature: "messageChannel" }, async () => ({ message: "a message reply" }))
          .open({ nature: "entitiesChannel" }, async () => ({ output: { literal: [{ id: "literal-1" }] } }))
          .open({ nature: "objectChannel" }, async () => ({ object: { grade: 1 } }));
        const folded = await Hallucination(cortex).dialogue.render({
          turns: [userTurn("run every channel")],
          tools,
        });

        pin({ rounds: seen, folded }, "hallucination-tool-loop.snapshot.json");
      },
    );
  });

  specimen.describe("stream", () => {
    specimen.it(
      "response records across a tool round: call, yield, turn/full, response/close",
      async () => {
        const scripts = [
          [
            { event: "/turn/open", turn: { role: "assistant" } },
            {
              event: "/part/open",
              index: 0,
              part: { type: "tool_use", id: "use-1", name: "lookup", input: "" },
            },
            { event: "/part/delta", index: 0, delta: { input: '{"query":' } },
            { event: "/part/delta", index: 0, delta: { input: '"casa"}' } },
            { event: "/part/close", index: 0 },
            { event: "/turn/close", meta: { state: "tools" } },
          ],
          [
            { event: "/turn/open", turn: { role: "assistant" } },
            { event: "/part/open", index: 0, part: { type: "text", text: "" } },
            { event: "/part/delta", index: 0, delta: { text: "casa means house" } },
            { event: "/part/close", index: 0 },
            { event: "/turn/close", meta: { state: "complete" } },
          ],
        ];
        let cursor = 0;
        const cortex = new Cortex().register([
          {
            type: "dialogue",
            tune: [0.5, 0.5, 0.5],
            channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
            via: {
              stream: async () => {
                const script = scripts[cursor++];
                return (async function* () {
                  for (const packet of script) yield packet;
                })();
              },
            },
          },
        ]);

        const tools = new Vector().open({ nature: "lookup" }, async (ctx) => ({
          message: `${ctx.input.query} means house`,
          literal: [{ id: "literal-1" }],
        }));
        const collected = [];
        for await (const packet of await Hallucination(cortex).dialogue.stream({
          turns: [userTurn("what is casa")],
          tools,
        }))
          collected.push(packet);

        pin(collected, "hallucination-stream.snapshot.json");
      },
    );
  });

  specimen.describe("object derivation", () => {
    specimen.it(
      "the request carries output.schema with no respond splice; the structured turn folds",
      async () => {
        const seen = [];
        const cortex = new Cortex().register([
          {
            type: "dialogue",
            tune: [0.5, 0.5, 0.5],
            channels: { in: ["text"], out: ["object"] },
            via: {
              render: async (request) => {
                seen.push(request);
                const data = v.fill(request.output.schema, { verdict: "casa" });
                return {
                  role: "assistant",
                  parts: [{ type: "object", data }],
                  meta: { state: "complete" },
                  object: data,
                };
              },
            },
          },
        ]);

        const folded = await Hallucination(cortex).object.render({
          turns: [userTurn("casa")],
          output: { schema: Verdict },
        });

        specimen.expect(folded.output.object).toEqual({ verdict: "casa", grade: 0.5 });
        specimen.expect(seen[0].tools).toBe(undefined);
        pin({ request: seen[0], folded }, "hallucination-object-schema.snapshot.json");
      },
    );
  });
});
