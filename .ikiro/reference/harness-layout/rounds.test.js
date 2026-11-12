import { belt, Controller, shard, Span, specimen, Vector } from "@vivalence/typology";
import * as harness from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { textTurn, toolUseTurn } from "../../../commons/fixtures/testing/data/faculties.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, narrow, natures, seat, tool, unload } from "./load.test.js";

export const tooled = (ctx) => {
  const tools = new Vector().graft(tool, unload);
  const keys = Object.entries(ctx.thread.trait.TOOLED).sort(([a], [b]) => natures(a).length - natures(b).length);
  for (const [reference, load] of keys) {
    if (load === "eager") for (const entry of found(ctx, reference)) seat(ctx, tools, entry);
    if (load === "none") tools.trim(narrow(ctx, reference));
  }
  for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
  return tools.use(shard.context.bind("tools", tools));
};

specimen.describe("a load is declared the round after, and on the next request", () => {
  specimen.it("three rounds, then a fresh request from the trait", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector() };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
    const runtime = {
      reference: "/runtime/runtime",
      modes: { harness: { runtime: { manifest: harness.manifest, tools: harness.tools } } },
      daemons: { education },
    };
    const thread = { trait: { TOOLED: {} } };
    const ctx = { runtime, daemon: education, reference: education.reference, mode: francesca, thread, entities: { em: { flush: async () => {} } } };
    const fs = "/runtime/runtime/mode/harness/runtime/fs";
    const script = [
      toolUseTurn("call-1", "tool_load", { references: [fs] }),
      toolUseTurn("call-2", "tool_unload", { references: [`${fs}/delete`, `${fs}/write`, `${fs}/move`] }),
      textTurn("done"),
    ];
    const out = [""];
    const faculty = {
      type: "dialogue",
      via: {
        render: async (request) => {
          const names = shard.hallucinate.declarations(request.tools).map((held) => held.name);
          out.push(`round ${3 - script.length + 1} · ${names.length} tools declared`, ...names.map((name) => `  ${name}`));
          return script.shift();
        },
      },
    };
    const tools = tooled(ctx);
    const policy = { tools, controller: new Controller({ stdout: new Span("probe") }), rounds: 5, backoff: [] };
    const request = { turns: [{ role: "user", parts: [{ type: "text", text: "read me a file" }] }], tools };
    for await (const packet of belt.hallucinate.respond(faculty, "render", request, policy))
      if (packet.event === "/tool/yield") out.push(`  ↳ ${packet.result.condition ?? "ok"} ${Object.keys(packet.result.output ?? {})}`);
    out.push(JSON.stringify(thread.trait, null, 2));
    const next = shard.hallucinate.declarations(tooled(ctx)).map((held) => held.name);
    out.push(`next request · ${next.length} tools declared`, ...next.map((name) => `  ${name}`));
    console.log(out.join("\n"));
    specimen.expect(thread.trait.TOOLED).toEqual({
      [fs]: "eager",
      [`${fs}/delete`]: "none",
      [`${fs}/write`]: "none",
      [`${fs}/move`]: "none",
    });
    specimen.expect(next.filter((name) => name.includes("_fs_")).sort()).toEqual([
      "runtime_harness_runtime_fs_find",
      "runtime_harness_runtime_fs_read",
      "runtime_harness_runtime_fs_stat",
      "runtime_harness_runtime_fs_tree",
    ]);
  });
});
