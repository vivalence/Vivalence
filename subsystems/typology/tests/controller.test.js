import { specimen, Controller, Span, Vector, belt, fromm, v } from "@vivalence/typology";
import { metronome, until, tick } from "./scenarios/metronome.js";

const { Machine, Reflection, Record, Kill, MACHINE, SIGNALS } = v.primitives.controller;

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
  const journal = () =>
    root.stdout.history.map((record) => `${record.path.join(" › ")} ${record.track}${record.track === "status" ? ` ${record.data.code}` : ""}`);
  return { clock, root, out, run, deltas, journal };
};

specimen.describe("controller — one process, driven from stdin", () => {
  specimen.it("the machine is total where it must be and partial where it is", () => {
    specimen.expect([...Machine.errors(MACHINE)]).toEqual([]);
    specimen.expect(Object.keys(MACHINE)).toEqual(["states"]);
    const settled = Object.keys(MACHINE.states).filter((code) => MACHINE.states[code].settled === true);
    specimen.expect(settled).toEqual(["DONE", "STOPPED", "FAILED", "ABORTED"]);
    const controller = new Controller();
    for (const signal of SIGNALS) specimen.expect(controller.stdin.trie.has(signal)).toBe(true);
    specimen.expect(controller.stdin.trie.size).toBe(SIGNALS.length);
  });

  specimen.it("SIGSTOP holds the pump, SIGCONT releases it, SIGTERM lands STOPPED — the child obeys, the journal says so by path", async () => {
    const { clock, root, out, run, deltas, journal } = rig(
      [{ tool: { id: "c1", name: "lookup", input: { query: "x" } } }, { deltas: 9 }],
      async (ctx) => {
        const child = ctx.controller.branch("research");
        child.start();
        child.stop();
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
    specimen.expect([settled.signal, settled.reason]).toEqual(["SIGTERM", "test"]);
    specimen.expect(settled.error).toBeUndefined();
    specimen.expect(fromm.controller(root).exit).toBe(0);
    specimen.expect([...Reflection.errors(settled)]).toEqual([]);
    specimen.expect(out.at(-1)).toBe("/response/close");
    specimen.expect(journal()).toEqual([
      "hallucination status RUNNING",
      "hallucination start",
      "hallucination log",
      "hallucination log",
      "hallucination › lookup/c1 status RUNNING",
      "hallucination › lookup/c1 start",
      "hallucination › lookup/c1 log",
      "hallucination › lookup/c1 › research status RUNNING",
      "hallucination › lookup/c1 › research start",
      "hallucination › lookup/c1 › research stop",
      "hallucination › lookup/c1 › research status DONE",
      "hallucination › lookup/c1 log",
      "hallucination › lookup/c1 stop",
      "hallucination › lookup/c1 status DONE",
      "hallucination status PAUSED",
      "hallucination status RUNNING",
      "hallucination status STOPPING",
      "hallucination stop",
      "hallucination status STOPPED",
    ]);
    for (const record of root.stdout.history) specimen.expect([...Record.errors(record)]).toEqual([]);
  });

  specimen.it("a retryable fault is a note, not a fault; SIGKILL cuts the provider, and a hung tool dies with the parent's code", async () => {
    const hung = rig(
      [{ fault: "overloaded" }, { tool: { id: "c1", name: "lookup", input: { query: "x" } } }],
      async (ctx) => {
        const child = ctx.controller.branch("slow");
        child.start();
        await new Promise(() => {});
      },
    );
    hung.clock.release(1);
    await until(() => hung.journal().includes("hallucination › lookup/c1 › slow start"));
    specimen.expect(hung.root.status.is("RUNNING")).toBe(true);
    specimen.expect(hung.journal().filter((line) => line.endsWith(" fault"))).toEqual([]);
    specimen.expect(hung.root.stdout.history.find((record) => record.track === "log" && record.data.retry).data).toMatchObject({ retry: 1, message: "overloaded" });
    const child = [...hung.root.children][0];
    const grandchild = [...child.children][0];
    await hung.root.kill("SIGKILL", "operator");
    const [rootSettled, childSettled, grandSettled] = await Promise.all([hung.root.settled, child.settled, grandchild.settled]);
    await hung.run;
    specimen.expect([rootSettled.code, childSettled.code, grandSettled.code]).toEqual(["ABORTED", "ABORTED", "ABORTED"]);
    specimen.expect(rootSettled.reason).toBe("operator");
    specimen.expect(childSettled.reason).toBe("parent ABORTED");
    specimen.expect(grandSettled.reason).toBe("parent ABORTED");
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
    specimen.expect(streaming.journal().slice(-2)).toEqual(["hallucination status ABORTED", "hallucination stop"]);
  });
  specimen.it("a reason is what the caller said, or nothing; the status record carries the whole status", async () => {
    const running = () => {
      const controller = new Controller({ stdout: new Span("hallucination") });
      controller.start();
      return controller;
    };

    const stopped = running();
    await stopped.kill("SIGTERM");
    specimen.expect(stopped.status.reflection.signal).toBe("SIGTERM");
    specimen.expect(stopped.status.reflection.reason).toBeUndefined();
    stopped.stop();
    specimen.expect((await stopped.settled).code).toBe("STOPPED");
    specimen.expect(fromm.controller(stopped).exit).toBe(0);

    const told = running();
    await told.kill("SIGTERM", "/stop");
    specimen.expect(told.stdout.history.find((record) => record.track === "status" && record.data.code === "STOPPING").data).toMatchObject({ code: "STOPPING", signal: "SIGTERM", reason: "/stop" });

    const killed = running();
    await killed.kill("SIGKILL");
    const cut = await killed.settled;
    specimen.expect([cut.code, cut.reason]).toEqual(["ABORTED", "SIGKILL"]);

    const external = running();
    external.abort.abort();
    specimen.expect((await external.settled).reason.name).toBe("AbortError");

    const said = running();
    await said.kill("SIGKILL", "user pressed kill");
    specimen.expect((await said.settled).reason).toBe("user pressed kill");
  });

  specimen.it("a failed run carries the fault's plain shape; a status outside the machine throws, named", async () => {
    const failed = new Controller({ stdout: new Span("hallucination") }).start();
    failed.fault(new Error("the oracle falters"));
    specimen.expect(JSON.parse(JSON.stringify(failed.toJSON())).error).toMatchObject({ type: "Error", message: "the oracle falters" });
    specimen.expect(failed.stdout.history.find((record) => record.track === "status" && record.data.code === "FAILED").data.error.message).toBe("the oracle falters");

    const typo = new Controller({ stdout: new Span("hallucination") }).start();
    specimen.expect(() => typo.status.set({ code: "STOPED" })).toThrow("[controller] no status STOPED in a machine of IDLE");
  });

  specimen.it("a kill packet is a signal: nature, body, flags", () => {
    specimen.expect([...Kill.errors({ nature: "SIGTERM", body: ["user pressed stop"], flags: {} })]).toEqual([]);
    specimen.expect([...Kill.errors({ nature: "SIGTERM", body: [] })]).toEqual([]);
    specimen.expect([...Kill.errors({ signal: "SIGTERM", input: "user pressed stop" })].length > 0).toBe(true);
  });
});
