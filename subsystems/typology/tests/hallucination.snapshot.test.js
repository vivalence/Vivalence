import { join } from "@std/path";
import { specimen, v, Cortex, Hallucination } from "@vivalence/typology";

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
  return { role: "assistant", parts: [{ type: "text", text }], meta: { stop: "end_turn" } };
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

specimen.describe("hallucination snapshot — the compiled provider contract, pinned as-is", () => {
  specimen.describe("request compilation", () => {
    specimen.it("system + extend + hoisted system turn + fn/spec tools + settings + output", async () => {
      const seen = [];
      const cortex = scriptedCortex([sealedTurn("sealed")], seen);

      const hallucination = Hallucination(cortex, {
        settings: { temperature: 0, maxTokens: 128 },
        output: { object: Verdict },
      });
      hallucination.context.system("You are the request pin.");
      hallucination.context.extend({ language: "pt-BR", learner: { level: "a1" } });
      hallucination.entities.turn.append(
        userTurn("primeira"),
        { role: "system", parts: [{ type: "text", text: "hoisted directive" }] },
        { role: "assistant", parts: [{ type: "text", text: "resposta" }] },
      );
      hallucination.entities.tool.add("bare", async () => "bare ran");
      hallucination.entities.tool.add("dressed", {
        valence: "looks up a word",
        input: LookupInput,
        execute: async () => "dressed ran",
      });
      await hallucination.dialogue.render();

      pin(seen[0], "hallucination-request.snapshot.json");
    });

    specimen.it("JSON.stringify drops execute closures — the accidental wire contract", async () => {
      const seen = [];
      const cortex = scriptedCortex([sealedTurn("sealed")], seen);

      const hallucination = Hallucination(cortex);
      hallucination.entities.tool.add("bare", async () => "bare ran");
      hallucination.entities.tool.add("dressed", {
        valence: "looks up a word",
        input: LookupInput,
        execute: async () => "dressed ran",
      });
      hallucination.entities.turn.append(userTurn("casa"));
      await hallucination.dialogue.render();

      specimen.expect(typeof seen[0].tools.bare.execute).toBe("function");
      specimen.expect(Object.keys(seen[0].tools.bare)).toEqual(["execute"]);
      specimen.expect(typeof seen[0].tools.dressed.execute).toBe("function");
      pin(seen[0], "hallucination-serialized-request.snapshot.json");
    });

    specimen.it("the json getter exposes config + context + tool names + live turns", () => {
      const hallucination = Hallucination(new Cortex(), {
        tune: "balanced",
        settings: { temperature: 0 },
        output: { object: Verdict },
      });
      hallucination.context.system("You are the json pin.");
      hallucination.context.extend({ language: "pt-BR" });
      hallucination.entities.tool.add("bare", async () => "bare ran");
      hallucination.entities.tool.add("dressed", { valence: "looks up a word", input: LookupInput });
      hallucination.entities.turn.append(userTurn("casa"));

      pin(hallucination.json, "hallucination-json.snapshot.json");
    });
  });

  specimen.describe("tool loop", () => {
    specimen.it("multi-round transcript: input parsing variants + yield-channel packing", async () => {
      const seen = [];
      const cortex = scriptedCortex(
        [
          {
            role: "assistant",
            parts: [
              { type: "tool_use", id: "use-1", name: "reflect", input: { query: "casa" } },
              { type: "tool_use", id: "use-2", name: "reflect", input: JSON.stringify({ query: "amigo" }) },
              { type: "tool_use", id: "use-3", name: "reflect", input: "" },
              { type: "tool_use", id: "use-4", name: "phantom", input: { ignored: true } },
            ],
            meta: { stop: "tool_use" },
          },
          {
            role: "assistant",
            parts: [
              { type: "tool_use", id: "use-5", name: "plainString", input: {} },
              { type: "tool_use", id: "use-6", name: "messageChannel", input: {} },
              { type: "tool_use", id: "use-7", name: "entitiesChannel", input: {} },
              { type: "tool_use", id: "use-8", name: "objectChannel", input: {} },
            ],
            meta: { stop: "tool_use" },
          },
          sealedTurn("all channels covered"),
        ],
        seen,
      );

      const hallucination = Hallucination(cortex);
      hallucination.entities.tool.add("reflect", async (input) => ({ message: input }));
      hallucination.entities.tool.add("plainString", async () => "a bare string reply");
      hallucination.entities.tool.add("messageChannel", async () => ({ message: "a message reply" }));
      hallucination.entities.tool.add("entitiesChannel", async () => ({
        entities: { literal: [{ id: "literal-1" }] },
      }));
      hallucination.entities.tool.add("objectChannel", async () => ({ object: { grade: 1 } }));
      hallucination.entities.turn.append(userTurn("run every channel"));
      const sealed = await hallucination.dialogue.render();

      pin({ rounds: seen, sealed }, "hallucination-tool-loop.snapshot.json");
    });
  });

  specimen.describe("stream", () => {
    specimen.it("packet sequence across a tool round includes drain-injected results", async () => {
      const scripts = [
        [
          { event: "/turn/open", turn: { role: "assistant" } },
          { event: "/part/open", index: 0, part: { type: "tool_use", id: "use-1", name: "lookup", input: "" } },
          { event: "/part/delta", index: 0, delta: { input: '{"query":' } },
          { event: "/part/delta", index: 0, delta: { input: '"casa"}' } },
          { event: "/part/close", index: 0 },
          { event: "/turn/close", meta: { stop: "tool_use" } },
        ],
        [
          { event: "/turn/open", turn: { role: "assistant" } },
          { event: "/part/open", index: 0, part: { type: "text", text: "" } },
          { event: "/part/delta", index: 0, delta: { text: "casa means house" } },
          { event: "/part/close", index: 0 },
          { event: "/turn/close", meta: { stop: "end_turn" } },
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

      const hallucination = Hallucination(cortex);
      hallucination.entities.tool.add("lookup", async (input) => ({
        message: `${input.query} means house`,
        entities: { literal: [{ id: "literal-1" }] },
      }));
      hallucination.entities.turn.append(userTurn("what is casa"));

      const collected = [];
      for await (const packet of await hallucination.dialogue.stream()) collected.push(packet);

      pin(collected, "hallucination-stream.snapshot.json");
    });
  });

  specimen.describe("object derivation", () => {
    specimen.it("schema present: respond tool + tool_choice rewrite, fill-defaulted synthesis", async () => {
      const seen = [];
      const cortex = scriptedCortex(
        [
          {
            role: "assistant",
            parts: [
              {
                type: "tool_use",
                id: "respond-1",
                name: "respond",
                input: JSON.stringify({ verdict: "casa" }),
              },
            ],
            meta: { stop: "tool_use" },
          },
        ],
        seen,
      );

      const hallucination = Hallucination(cortex).output.object(Verdict);
      hallucination.entities.turn.append(userTurn("casa"));
      const sealed = await hallucination.object.render();

      specimen.expect(sealed.object).toEqual({ verdict: "casa", grade: 0.5 });
      pin({ request: seen[0], sealed }, "hallucination-object-schema.snapshot.json");
    });

    specimen.it("schema absent: respond tool carries no input schema, data passes unfilled", async () => {
      const seen = [];
      const cortex = scriptedCortex(
        [
          {
            role: "assistant",
            parts: [
              {
                type: "tool_use",
                id: "respond-1",
                name: "respond",
                input: JSON.stringify({ answer: 42 }),
              },
            ],
            meta: { stop: "tool_use" },
          },
        ],
        seen,
      );

      const hallucination = Hallucination(cortex);
      hallucination.entities.turn.append(userTurn("casa"));
      const sealed = await hallucination.object.render();

      specimen.expect(sealed.object).toEqual({ answer: 42 });
      pin({ request: seen[0], sealed }, "hallucination-object-bare.snapshot.json");
    });

    specimen.it("model ignores respond: the raw dialogue turn falls through, object undefined", async () => {
      const seen = [];
      const cortex = scriptedCortex([sealedTurn("I refuse to use tools.")], seen);

      const hallucination = Hallucination(cortex).output.object(Verdict);
      hallucination.entities.turn.append(userTurn("casa"));
      const sealed = await hallucination.object.render();

      specimen.expect(sealed.object).toBe(undefined);
      pin({ request: seen[0], sealed }, "hallucination-object-fallthrough.snapshot.json");
    });
  });
});
