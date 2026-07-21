// TANGLED from docs/40-49_repository/47_integration/47.02_hallucination-triad.org
// Didactic, runnable guide to the cortex → hallucination → harnessed triad.
// Edit the .org, re-tangle; or edit here and keep the .org src blocks in sync.
// Run: deno task --cwd systems/runtime test  (this file lives under the runtime workspace
// because Act II imports @vivalence/runtime transitively; docs/ is excluded from the workspace).

import { specimen, soma, Cortex } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";

// A Faculty is a dumb, stateless, single-shot provider: {type, tune, channels, via:{render,stream}}.
// render(turns, config) → one Turn. stream(turns, config) → AsyncGen<Packet>. Nothing else.
// This literal IS the whole provider contract — the anthropic provider ships the same shape.
function tutor() {
  const lastUser = (turns) => {
    for (let i = turns.length - 1; i >= 0; i--) {
      const text = turns[i].role === "user" && turns[i].parts?.find((p) => p.type === "text")?.text;
      if (text) return text;
    }
    return "";
  };
  const answered = (turns) => turns.at(-1)?.parts?.some((p) => p.type === "tool_result");
  return {
    type: "dialogue",
    tune: [0.9, 1.0, 0.3], // [intelligence, reasoning, speed] — register pads thrift → 0.5
    channels: { in: ["text", "tool_result"], out: ["text", "tool_use"] },
    via: {
      render: async (request) => {
        const { turns, tools, output } = request;
        // A structured output was asked for → the provider returns an object turn.
        if (output?.object) {
          const data = { query: lastUser(turns) };
          return { role: "assistant", parts: [{ type: "object", data }], meta: { state: "complete" }, object: data };
        }
        // A real tool is on the table and unanswered → call it, then the loop feeds the result back.
        if (tools?.length && !answered(turns)) {
          return {
            role: "assistant",
            parts: [{ type: "tool_use", id: "call-1", name: tools[0].name, input: { query: lastUser(turns) } }],
            meta: { state: "tools" },
          };
        }
        return { role: "assistant", parts: [{ type: "text", text: `answer: ${lastUser(turns)}` }], meta: { state: "complete" } };
      },
    },
  };
}

specimen.describe("47.02 hallucination triad — the request in isolation (typology only)", () => {
  // Cortex is a faculty repository. Register providers, then SPAWN a request through it.
  const cortex = () => new Cortex().register([tutor()]);

  specimen.it("cortex.hallucination(config) is the spawn seam — construct + seed in one call", async () => {
    const request = cortex().hallucination({ tune: "unleashed" }); // eager configure(); no `new`
    request.context.system("You are a patient tutor.").entities.turn.append({ role: "user", parts: [{ type: "text", text: "olá" }] });

    const folded = await request.dialogue.render(); // shape.object trie: /dialogue/render leaf
    specimen.expect(folded.message).toBe("answer: olá");
  });

  specimen.it("a tool loop runs at the leaf, once — tool_use → execute → tool_result → final turn", async () => {
    const request = cortex().hallucination();
    request.tools.open({ nature: "lookup" }, async (ctx) => ({ found: ctx.input.query.toUpperCase() }));
    request.entities.turn.append({ role: "user", parts: [{ type: "text", text: "brasil" }] });

    const folded = await request.dialogue.render(); // round 1 calls lookup, round 2 answers
    specimen.expect(folded.state).toBe("complete");
    specimen.expect(folded.message).toBe("answer: brasil");
  });

  specimen.it("object is DERIVED from dialogue — the derivation resolves the same provider, output-aware", async () => {
    // No `object` faculty registered; findOne derives one by pointing at the dialogue donor.
    const request = cortex().hallucination().output.object({ type: "object" });
    request.entities.turn.append({ role: "user", parts: [{ type: "text", text: "hi" }] });

    const folded = await request.object.render(); // provider honors request.output → object turn
    specimen.expect(folded.object).toEqual({ query: "hi" });
  });
});

specimen.describe("47.02 hallucination triad — the tooling seam end to end (runtime)", () => {
  // Harnessed conditions a fresh request from ctx.input via daemon.cortex.hallucination({...}),
  // scribes assistant turns, and loads thread history. Same triad, now persistence-wired.
  let scenario;
  specimen.beforeAll(async () => (scenario = await create()));
  specimen.afterAll(async () => await scenario.orm.close());

  const collect = async (stream) => {
    let turn = null;
    for await (const packet of stream) turn = soma.pour(turn, packet);
    return turn;
  };

  specimen.it("dewey.harness.dialogue.stream persists user + assistant turns", async () => {
    const thread = await scenario.createThread();
    const stream = await scenario.dewey.harness.dialogue.stream({
      parts: [{ type: "text", text: "hello dewey" }],
      thread,
      tune: "balanced", // picks the sonnet faculty via nearest()
    });
    const turn = await collect(stream);
    specimen.expect(turn.parts[0].text).toContain("hello dewey");
  });
});
