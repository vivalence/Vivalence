import { specimen, Controller, Span, Vector, belt, v } from "@vivalence/typology";
import { metronome, until, tick } from "./scenarios/metronome.js";

const { Machine, Reflection, Record, MACHINE } = v.primitives.controller;

const rig = (script, tool) => {
  const clock = metronome(script);
  const root = new Controller({ stdout: new Span("hallucination") });
  const tools = new Vector().open({ nature: "lookup", input: v.object({ query: v.string() }) }, tool);
  const turns = [{ role: "user", parts: [{ type: "text", text: "go" }] }];
  const out = [];
  const run = (async () => {
    for await (const packet of belt.hallucinate.respond(clock.faculty, "stream", { turns }, { rounds: 3, backoff: [0], tools, controller: root }))
      out.push(packet.event);
  })();
  const deltas = () => out.filter((event) => event === "/part/delta").length;
  const journal = () => root.stdout.records.map((record) => `${record.path} ${record.verb}`);
  return { clock, root, out, run, deltas, journal };
};

specimen.describe("controller — one process, driven from stdin", () => {
  specimen.it("the machine is total where it must be and partial where it is", () => {
    specimen.expect([...Machine.errors(MACHINE)]).toEqual([]);
    for (const table of Object.values(MACHINE.transitions))
      for (const [from, to] of Object.entries(table)) {
        specimen.expect(MACHINE.states[from].settled).toBeFalsy();
        specimen.expect(MACHINE.states[to]).toBeDefined();
      }
    for (const verb of Object.values(MACHINE.signals)) specimen.expect(MACHINE.verbs[verb]).toBeDefined();
  });

  specimen.it("SIGSTOP holds the pump, SIGCONT releases it, SIGTERM lands STOPPED — the child obeys, the journal says so by path", async () => {
    const { clock, root, out, run, deltas, journal } = rig(
      [{ tool: { id: "c1", name: "lookup", input: { query: "x" } } }, { deltas: 9 }],
      async (ctx) => {
        const child = ctx.controller.branch("research");
        child.stdout.open();
        child.stdout.close();
        return { message: "found" };
      },
    );
    clock.release(1);
    await until(() => out.includes("/tool/yield"));
    specimen.expect(root.toJSON().children).toEqual([]);
    clock.release(2);
    await until(() => deltas() === 2);
    await root.kill("SIGSTOP");
    specimen.expect(root.status.is("PAUSED")).toBe(true);
    clock.release(2);
    await tick();
    specimen.expect(deltas()).toBe(2);
    await root.kill("SIGCONT");
    await until(() => deltas() === 4);
    await root.kill("SIGTERM", "test");
    specimen.expect(root.status.is("STOPPING")).toBe(true);
    clock.release(1);
    const settled = await root.settled;
    await run;
    specimen.expect(settled.code).toBe("STOPPED");
    specimen.expect([settled.error.code, settled.error.message]).toEqual(["STOPPED", "test"]);
    specimen.expect([...Reflection.errors(settled)]).toEqual([]);
    specimen.expect(out.at(-1)).toBe("/response/close");
    specimen.expect(journal()).toEqual([
      "/hallucination open",
      "/hallucination note",
      "/hallucination note",
      "/hallucination/lookup open",
      "/hallucination/lookup/research open",
      "/hallucination/lookup/research close",
      "/hallucination/lookup close",
      "/hallucination pause",
      "/hallucination resume",
      "/hallucination stop",
      "/hallucination close",
    ]);
    for (const record of root.stdout.records) specimen.expect([...Record.errors(record)]).toEqual([]);
  });

  specimen.it("a retryable fault is a note, not a fault; SIGKILL cuts the provider, and a hung tool dies with the parent's code", async () => {
    const hung = rig(
      [{ fault: "overloaded" }, { tool: { id: "c1", name: "lookup", input: { query: "x" } } }],
      async (ctx) => {
        const child = ctx.controller.branch("slow");
        child.stdout.open();
        await new Promise(() => {});
      },
    );
    hung.clock.release(1);
    await until(() => hung.journal().includes("/hallucination/lookup/slow open"));
    specimen.expect(hung.root.status.is("RUNNING")).toBe(true);
    specimen.expect(hung.journal().filter((line) => line.endsWith(" fault"))).toEqual([]);
    specimen.expect(hung.root.stdout.records.find((record) => record.verb === "note" && record.data.retry).data).toMatchObject({ retry: 1, message: "overloaded" });
    const child = [...hung.root.children][0];
    const grandchild = [...child.children][0];
    await hung.root.kill("SIGKILL", "operator");
    const [rootSettled, childSettled, grandSettled] = await Promise.all([hung.root.settled, child.settled, grandchild.settled]);
    await hung.run;
    specimen.expect([rootSettled.code, childSettled.code, grandSettled.code]).toEqual(["ABORTED", "ABORTED", "ABORTED"]);
    specimen.expect(rootSettled.error.message).toBe("operator");
    specimen.expect(childSettled.error.record.data.reason).toBe("parent ABORTED");
    specimen.expect(grandSettled.error.record.data.reason).toBe("parent ABORTED");
    specimen.expect(hung.root.toJSON().children).toEqual([]);
    specimen.expect(hung.out.at(-1)).toBe("/response/close");
    specimen.expect(hung.clock.seen.aborted).toEqual([]);

    const streaming = rig([{ deltas: 9 }], async () => ({ message: "unused" }));
    streaming.clock.release(2);
    await until(() => streaming.deltas() === 2);
    await streaming.root.kill("SIGKILL", "operator");
    await streaming.run;
    specimen.expect((await streaming.root.settled).code).toBe("ABORTED");
    specimen.expect(streaming.clock.seen.aborted).toEqual(["operator"]);
    specimen.expect(streaming.out.at(-1)).toBe("/response/close");
    specimen.expect(streaming.journal().slice(-2)).toEqual(["/hallucination abort", "/hallucination close"]);
  });
  specimen.it("a reason is words or nothing: a wire's empty input never becomes the message", async () => {
    const running = () => {
      const controller = new Controller({ stdout: new Span("hallucination") });
      controller.stdout.open();
      return controller;
    };

    const stopped = running();
    await stopped.kill("SIGTERM", {});
    specimen.expect(stopped.stdout.records.find((record) => record.verb === "stop").data).toEqual({ signal: "SIGTERM" });
    stopped.stdout.close();
    specimen.expect((await stopped.settled).error.message).toBe("SIGTERM");

    const killed = running();
    await killed.kill("SIGKILL", {});
    const cut = await killed.settled;
    specimen.expect([cut.code, cut.error.message]).toEqual(["ABORTED", "SIGKILL"]);

    const bare = running();
    await bare.kill("SIGKILL");
    specimen.expect((await bare.settled).error.message).toBe("SIGKILL");

    const external = running();
    external.abort.abort();
    specimen.expect((await external.settled).error.message).toBe("abort");

    const said = running();
    await said.kill("SIGKILL", "user pressed kill");
    specimen.expect((await said.settled).error.message).toBe("user pressed kill");
  });
});
