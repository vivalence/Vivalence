import { shard, specimen, steer } from "@vivalence/typology";
import { fixture, mount, snapshot } from "../lib/fixture.js";
import { print } from "../lib/world.js";
import { declarations, tool, unload } from "../lib/copied/load.js";
import { modes } from "../lib/copied/resolve.js";
import { preload, listing } from "../lib/copied/preload.js";
import { primer } from "../lib/copied/primer-reference.js";

const SNAP = new URL("../snapshots/component", import.meta.url).pathname;
const clone = (value) => JSON.parse(JSON.stringify(value));

const educationCtx = (f, thread) => ({
  runtime: f.runtime,
  daemon: f.education,
  mode: f.francesca,
  thread,
  entities: { em: f.em },
});

const primerOnly = (f) => {
  const education = { ...f.education, modes: { tactic: { harvest: f.harvest }, teacher: { francesca: f.francesca } } };
  const runtime = { ...f.runtime, daemons: { education, chess: f.chess } };
  return { ...f, education, runtime };
};

specimen.describe("L2 component — the probe tool vectors, whole", () => {
  specimen.it("modes/index · every detail · Q24B shape · Q26 writes nothing", async () => {
    const f = await fixture();
    const thread = { trait: { TOOLED: { "/daemon/chess/mode/teacher/coach": "eager" }, PRIMED: {} } };
    const before = clone(thread);
    const { call } = mount([modes], educationCtx(f, thread));
    const references = ["/runtime", "/daemon/education", "/daemon/education/mode/tactic", "/tactic/harvest", "/teacher/francesca", "/daemon/chess/mode/teacher", "/nowhere"];
    const sizes = [];
    for (const reference of references)
      for (const detail of ["modes", "outline", "signatures"]) {
        const result = await call("modes_index", { reference, detail });
        const path = snapshot(SNAP, `modes_index ${reference.replaceAll("/", "~")} ${detail}`, result);
        sizes.push({ reference, detail, modes: result.output.modes.map((held) => held.reference), chars: JSON.stringify(result.output).length, snapshot: path });
      }
    print("modes_index matrix (7 references × 3 details = 21)", sizes);
    const small = await call("modes_index", { reference: "/teacher/francesca", detail: "signatures" });
    print("modes_index /teacher/francesca signatures, whole", small);
    print("modes_index /teacher/francesca default detail", await call("modes_index", { reference: "/teacher/francesca" }));
    const pattern = steer.trie.leaves(modes)[0].pattern;
    print("Q24B · input examples · output examples · valence", {
      inputExamples: pattern.input.examples,
      outputExamples: pattern.output.examples,
      valence: pattern.valence,
    });
    print("thread after 22 index calls", thread);
    specimen.expect(thread).toEqual(before);
    specimen.expect(pattern.input.examples.length).toBe(3);
    specimen.expect(pattern.output.examples.length).toBe(1);
    specimen.expect(sizes.find((row) => row.reference === "/teacher/francesca").modes).toEqual(["/daemon/education/mode/teacher/francesca"]);
  });

  specimen.it("Q24 · the SAME reference read by modes/index, tool/load, primer/load — one reading?", async () => {
    const f = primerOnly(await fixture());
    const shorts = ["/runtime/harness/runtime", "/daemon/chess/teacher/coach", "/tactic/harvest", "/role", "/drill"];
    const rows = [];
    for (const reference of shorts) {
      const thread = { trait: { TOOLED: {}, PRIMED: {} } };
      const { call } = mount([modes, tool, primer], educationCtx(f, thread));
      const indexed = (await call("modes_index", { reference, detail: "modes" })).output.modes.map((held) => held.reference);
      await call("tool_load", { references: [reference] });
      await call("primer_load", { references: [reference] });
      rows.push({ reference, indexed, TOOLED: Object.keys(thread.trait.TOOLED), PRIMED: Object.keys(thread.trait.PRIMED) });
    }
    print("one reference, three readers (home education·francesca)", rows);
    const marker = rows.filter((row) => row.reference.startsWith("/runtime/") || row.reference.startsWith("/daemon/"));
    specimen.expect(marker.every((row) => row.indexed.length > 0 && row.PRIMED.length > 0)).toBe(true);
  });

  specimen.it("tool/load · single · many · branch · Q21 '/runtime' · Q25A {tools} vs the live declarations", async () => {
    const f = await fixture();
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { tools, call } = mount([tool, unload], educationCtx(f, thread));
    const steps = [
      { references: ["/drill/deal"] },
      { references: ["/tactic/harvest/drain", "/daemon/chess/mode/teacher/coach/whoami"] },
      { references: ["/daemon/chess/mode/teacher/coach"] },
      { references: ["/runtime"] },
      { references: ["/nowhere", "/daemon/nowhere"] },
    ];
    for (const input of steps) {
      const answer = await call("tool_load", input);
      const live = shard.hallucinate.declarations(tools).filter((held) => answer.output.tools.some((loaded) => loaded.name === held.name));
      const path = snapshot(SNAP, `tool_load ${JSON.stringify(input.references).replaceAll("/", "~")}`, { input, answer, trait: thread.trait, live });
      print(`tool_load ${JSON.stringify(input)}`, {
        answerNames: answer.output.tools.map((held) => held.name),
        answerHasOutput: answer.output.tools.filter((held) => held.output).map((held) => held.name),
        liveHasOutput: live.filter((held) => held.output).map((held) => held.name),
        trait: thread.trait,
        snapshot: path,
      });
    }
    const runtimeNames = (await call("tool_load", { references: ["/runtime"] })).output.tools.map((held) => held.name);
    print("Q21 '/runtime' loaded names", runtimeNames);
    const answer = await call("tool_load", { references: ["/runtime"] });
    const live = shard.hallucinate.declarations(tools).filter((held) => answer.output.tools.some((loaded) => loaded.name === held.name));
    print("Q25A: answer item whole (first) vs live declaration (first)", { answer: answer.output.tools[0], live: live[0] });
    specimen.expect(runtimeNames.length > 0).toBe(true);
    specimen.expect(answer.output.tools).toEqual(live);
  });

  specimen.it("tool/load over a REAL daemon: a mode with no tools export (cloze) under '/daemon/education'", async () => {
    const f = await fixture();
    print("cloze exports", { keys: Object.keys(f.cloze), tools: Boolean(f.cloze.tools), primer: Boolean(f.cloze.primer), type: f.cloze.manifest.type });
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { call } = mount([tool], educationCtx(f, thread));
    let fault = null;
    let answer = null;
    try {
      answer = await call("tool_load", { references: ["/daemon/education"] });
    } catch (error) {
      fault = `${error.name}: ${error.message}`;
    }
    print("tool_load /daemon/education", { names: answer?.output.tools.map((held) => held.name), fault, trait: thread.trait });
    specimen.expect(fault).toBe(null);
  });

  specimen.it("tool/load on a reference that matches nothing: loud?", async () => {
    const f = await fixture();
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { call } = mount([tool], educationCtx(f, thread));
    let fault = null;
    let answer = null;
    try {
      answer = await call("tool_load", { references: ["/nowhere"] });
    } catch (error) {
      fault = error.message;
    }
    print("tool_load /nowhere", { answer, fault, trait: thread.trait });
    specimen.expect(fault).not.toBe(null);
  });

  specimen.it("tool/unload · Q16 exact key DELETED · a narrower under a kept key = none (S7) · Q4A re-load", async () => {
    const f = await fixture();
    const fs = `/runtime/runtime/mode/${f.harness.manifest.type}/${f.harness.manifest.slug}/fs`;
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { tools, call } = mount([tool, unload], educationCtx(f, thread));
    const log = [];
    const step = async (name, input) => {
      const answer = await call(name, input);
      log.push({ call: name, input, answer: answer.output.unloaded ?? answer.output.tools.map((held) => held.name), trait: clone(thread.trait.TOOLED), declared: declarations(tools).map((held) => held.name) });
    };
    await step("tool_load", { references: [fs, "/tactic/harvest"] });
    await step("tool_unload", { references: [`${fs}/delete`] });
    await step("tool_unload", { references: ["/tactic/harvest"] });
    await step("tool_load", { references: [fs] });
    await step("tool_unload", { references: [fs] });
    await step("tool_unload", { references: ["/never/loaded"] });
    print("unload ledger, whole", log);
    specimen.expect(Object.hasOwn(log[2].trait, "/daemon/education/mode/tactic/harvest")).toBe(false);
    specimen.expect(log[1].trait[`${fs}/delete`]).toBe("none");
    specimen.expect(log[3].declared.some((name) => name.endsWith("fs_delete"))).toBe(true);
    specimen.expect(Object.keys(log[4].trait)).toEqual([]);
  });

  specimen.it("tool/preload · writes lazy · never downgrades eager (Q4A) · declares nothing · next prompt lists", async () => {
    const f = await fixture();
    const fs = `/runtime/runtime/mode/${f.harness.manifest.type}/${f.harness.manifest.slug}/fs`;
    const thread = { trait: { TOOLED: { [fs]: "eager", "/daemon/chess/mode/teacher/coach/whoami": "none" }, PRIMED: {} } };
    const ctx = educationCtx(f, thread);
    const { tools, call } = mount([preload], ctx);
    const answer = await call("tool_preload", { references: ["/tactic/harvest", `${fs}/read`, fs, "/daemon/chess/mode/teacher/coach/whoami"] });
    print("tool_preload answer, whole", answer);
    print("trait after", thread.trait);
    print("declared after preload (only tool_preload itself expected)", declarations(tools).map((held) => held.name));
    print("next system prompt listing", listing(ctx));
    specimen.expect(thread.trait.TOOLED[fs]).toBe("eager");
    specimen.expect(Object.hasOwn(thread.trait.TOOLED, `${fs}/read`)).toBe(false);
    specimen.expect(thread.trait.TOOLED["/daemon/education/mode/tactic/harvest"]).toBe("lazy");
    specimen.expect(declarations(tools).map((held) => held.name)).toEqual(["tool_preload"]);
  });

  specimen.it("MISSING · primer/load through narrow: marker forms, home-relative, absolute — PRIMED keys absolute (Q24A)", async () => {
    const f = primerOnly(await fixture());
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { call } = mount([primer], educationCtx(f, thread));
    const runtimeSection = `/runtime/runtime/mode/${f.harness.manifest.type}/${f.harness.manifest.slug}/identity`;
    const inputs = [
      "/role",
      "/teacher/francesca/role",
      "/daemon/chess/mode/teacher/coach/role",
      "/daemon/chess/teacher/coach/role",
      runtimeSection,
      `/runtime/${f.harness.manifest.type}/${f.harness.manifest.slug}/identity`,
    ];
    const rows = [];
    for (const reference of inputs) {
      const before = Object.keys(thread.trait.PRIMED).length;
      const answer = await call("primer_load", { references: [reference] });
      rows.push({ reference, loaded: answer.output.primers.map((held) => ({ reference: held.reference, chars: held.text.length })), added: Object.keys(thread.trait.PRIMED).length - before });
    }
    print("primer_load per reference form", rows);
    print("PRIMED, whole", thread.trait.PRIMED);
    specimen.expect(Object.keys(thread.trait.PRIMED).every((key) => key.startsWith("/daemon/") || key.startsWith("/runtime/"))).toBe(true);
    specimen.expect(rows.filter((row) => row.loaded.length === 0).map((row) => row.reference)).toEqual([]);
  });

  specimen.it("primer/load over a REAL daemon: a mode with no primer export (nyan · cloze)", async () => {
    const f = await fixture();
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { call } = mount([primer], educationCtx(f, thread));
    let fault = null;
    try {
      await call("primer_load", { references: ["/role"] });
    } catch (error) {
      fault = `${error.name}: ${error.message}`;
    }
    print("primer_load /role with nyan · cloze on the daemon", { fault, trait: thread.trait });
    specimen.expect(fault).toBe(null);
  });

  specimen.it("MISSING · ctx.runtime · ctx.daemon in a foreign daemon mode's tool (owner host, Q22)", async () => {
    const f = await fixture();
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const { call } = mount([tool], { ...educationCtx(f, thread), statics: f.education.statics, reference: f.education.reference });
    await call("tool_load", { references: ["/daemon/chess/mode/teacher/coach/whoami", "/drill/deal"] });
    const foreign = await call("daemon_chess_teacher_coach_whoami");
    const own = await call("drill_deal");
    print("own tool ctx", own.output);
    print("foreign tool ctx", foreign.output);
    specimen.expect(foreign.output.statics).toEqual({ language: "en" });
    specimen.expect(foreign.output.runtime).toBe("/runtime/runtime");
    specimen.expect(foreign.output.daemon).toBe("/daemon/chess");
  });
});
