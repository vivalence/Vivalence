import { belt, Controller, shape, shard, Span, specimen, Vector } from "@vivalence/typology";
import { textTurn, toolUseTurn } from "/Users/finn/vivalence/code/vivalence/commons/fixtures/testing/data/faculties.js";
import { fixture, snapshot } from "../lib/fixture.js";
import { print } from "../lib/world.js";
import { found, home, narrow, natures, seat, tool, unload } from "../lib/copied/load.js";
import { primer, primerFound } from "../lib/copied/primer-reference.js";

const SNAP = new URL("../snapshots/integration", import.meta.url).pathname;

const tooled = (ctx) => {
  const tools = new Vector().graft(tool, unload, primer);
  const keys = Object.entries(ctx.thread.trait.TOOLED).sort(([a], [b]) => natures(a).length - natures(b).length);
  for (const [reference, load] of keys) {
    if (load === "eager") for (const entry of found(ctx, reference)) seat(ctx, tools, entry);
    if (load === "none") tools.trim(narrow(home(ctx), reference));
  }
  for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
  return tools.use(shard.context.bind("tools", tools));
};

const drive = async (label, ctx, script) => {
  const rounds = [];
  const faculty = {
    type: "dialogue",
    via: {
      render: async (request) => {
        rounds.push({ tools: shard.hallucinate.declarations(request.tools), turns: JSON.parse(JSON.stringify(request.turns)) });
        return script.shift();
      },
    },
  };
  const tools = tooled(ctx);
  const policy = { tools, controller: new Controller({ stdout: new Span(label) }), rounds: 8, backoff: [] };
  const request = { turns: [{ role: "user", parts: [{ type: "text", text: "go" }] }], tools };
  const packets = [];
  for await (const packet of belt.hallucinate.respond(faculty, "render", request, policy))
    if (["/tool/yield", "/response/close"].includes(packet.event)) packets.push(packet);
  const next = shard.hallucinate.declarations(tooled(ctx));
  const path = snapshot(SNAP, label, { rounds, packets, trait: ctx.thread.trait, next });
  return { rounds, packets, next, path };
};

const prefixStable = (rounds) =>
  rounds.slice(1).map((round, index) => {
    const before = rounds[index].tools.map((held) => held.name);
    const now = round.tools.map((held) => held.name);
    const kept = now.filter((name) => before.includes(name));
    return { round: index + 2, appendOnly: before.every((name, at) => now[at] === name) || kept.length < before.length, inserted: now.filter((name) => !before.includes(name)).map((name) => ({ name, at: now.indexOf(name) })), removed: before.filter((name) => !now.includes(name)) };
  });

specimen.describe("L3 integration — the harnessed loop on the design's pieces", () => {
  specimen.it("education home: loads land the round after; Q8 — is the tool list append-only (cache prefix)?", async () => {
    const f = await fixture();
    const ctx = { runtime: f.runtime, daemon: f.education, mode: f.francesca, thread: { trait: { TOOLED: {}, PRIMED: {} } }, entities: { em: f.em } };
    const script = [
      toolUseTurn("c1", "tool_load", { references: ["/drill/deal"] }),
      toolUseTurn("c2", "tool_load", { references: ["/daemon/chess/mode/teacher/coach/whoami"] }),
      toolUseTurn("c3", "tool_load", { references: ["/drill/grade"] }),
      toolUseTurn("c4", "daemon_chess_teacher_coach_whoami", {}),
      textTurn("done"),
    ];
    const run = await drive("education-loop", ctx, script);
    print("per round declared names", run.rounds.map((round, index) => ({ round: index + 1, names: round.tools.map((held) => held.name) })));
    print("tool yields", run.packets);
    print("trait after", ctx.thread.trait);
    print("next request declared", run.next.map((held) => held.name));
    const stability = prefixStable(run.rounds);
    print("Q8 · per round: does the list only grow at the END? (whole snapshot)", { stability, snapshot: run.path });
    specimen.expect(run.packets.at(-1).meta.state).toBe("complete");
    specimen.expect(stability.every((row) => row.appendOnly)).toBe(true);
  });

  specimen.it("MISSING · a runtime-mode home through the loop (ctx.daemon = the runtime host)", async () => {
    const f = await fixture();
    const ctx = { runtime: f.runtime, daemon: f.runtime, mode: f.runtimeHarness, thread: { trait: { TOOLED: {}, PRIMED: {} } }, entities: { em: f.em } };
    const fs = `/runtime/runtime/mode/${f.harness.manifest.type}/${f.harness.manifest.slug}/fs`;
    const script = [
      toolUseTurn("c1", "tool_load", { references: ["/fs/read", "/daemon/education/tactic/harvest/drain"] }),
      toolUseTurn("c2", "tool_unload", { references: [`${fs}/read`] }),
      textTurn("done"),
    ];
    const run = await drive("runtime-loop", ctx, script);
    print("runtime home · per round declared names", run.rounds.map((round, index) => ({ round: index + 1, names: round.tools.map((held) => held.name) })));
    print("runtime home · yields", run.packets);
    print("runtime home · trait", ctx.thread.trait);
    print("runtime home · next request", run.next.map((held) => held.name));
    specimen.expect(Object.keys(ctx.thread.trait.TOOLED)).toEqual(["/daemon/education/mode/tactic/harvest/drain"]);
  });

  specimen.it("MISSING · a runtime-mode home as the LIVE runtime ctx gives it (no ctx.daemon)", async () => {
    const f = await fixture();
    const ctx = { runtime: f.runtime, mode: f.runtimeHarness, thread: { trait: { TOOLED: {}, PRIMED: {} } }, entities: { em: f.em } };
    const run = await drive("runtime-loop-nodaemon", ctx, [toolUseTurn("c1", "tool_load", { references: ["/fs/read"] }), textTurn("done")]);
    print("no ctx.daemon · yields", run.packets);
    specimen.expect(run.packets[0].result.condition ?? "NOMINAL").not.toBe("ERROR");
  });

  specimen.it("MISSING · the PRIMED half of the next request · Q9A double load (text in the turns == text the trait composes)", async () => {
    const f = await fixture();
    const education = { ...f.education, modes: { tactic: { harvest: f.harvest }, teacher: { francesca: f.francesca } } };
    const runtime = { ...f.runtime, daemons: { education, chess: f.chess } };
    const ctx = { runtime, daemon: education, mode: f.francesca, thread: { trait: { TOOLED: {}, PRIMED: {} } }, entities: { em: f.em } };
    const run = await drive("primed-loop", ctx, [toolUseTurn("c1", "primer_load", { references: ["/tactic/harvest", "/daemon/chess/mode/teacher/coach/role"] }), textTurn("done")]);
    const inTurns = run.packets[0].result.output.primers;
    const composed = [];
    for (const [reference, load] of Object.entries(ctx.thread.trait.PRIMED))
      if (load === "eager")
        for (const entry of primerFound(ctx, reference))
          composed.push({ reference: entry.reference, text: await shape.primer.read(entry.mode.primer, entry.nature, { ...ctx, mode: entry.mode }) });
    print("PRIMED after", ctx.thread.trait.PRIMED);
    print("loaded into the turns", inTurns.map((held) => ({ reference: held.reference, chars: held.text.length })));
    print("composed from PRIMED (SKETCH: no composer exists in the tree or the probes)", composed.map((held) => ({ reference: held.reference, chars: held.text.length })));
    print("the round-2 request's turns carry the load (whole tool_result part)", run.rounds[1].turns.at(-1));
    specimen.expect(composed).toEqual(inTurns);
  });
});
