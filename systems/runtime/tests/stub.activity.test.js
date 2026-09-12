import { specimen } from "@vivalence/typology";
import { metronome } from "@vivalence/typology/scenarios";
import provider from "../../../commons/fixtures/hal/stub/provider/index.js";
import { create } from "./scenarios/cortex.js";

const { ledger, until } = metronome;

// the stub in the belt: a scripted run, long enough to hold and kill, with a real activity row
// under it. this is the playground wiring — @commons/hallucinator/stub is playground's only
// hallucinator — measured without a browser.
let world;
specimen.beforeAll(async () => {
  world = await create();
  // playground's shape: the stub ALONE. the scenario seeds fixture faculties, and two
  // providers at neighbouring tunes would shadow each other on the nearest-tune pick.
  world.cortex.faculties.clear();
  world.cortex.register(await provider({ statics: { scripts: { stalled: "--stall 20s --deltas 6" } } }));
});
specimen.afterAll(async () => {
  await world.daemon.entities.activity.remove({});
  await world.orm.close();
});

const fire = (thread, text) => world.dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text }] });

specimen.describe("stub · the controller machine over a scripted run", () => {
  specimen.it("a stalled run is held by SIGSTOP, resumed by SIGCONT, and cut by SIGKILL without waiting the stall out", async () => {
    const roster = ledger(world.daemon.entities.activity);
    const thread = await world.createThread();

    const events = [];
    const streaming = (async () => {
      for await (const packet of await fire(thread, "--run stalled --pace 40ms")) events.push(packet.event);
    })();

    await until(() => roster.rows.length);
    const row = await world.daemon.entities.activity.findOneOrFail({ id: roster.rows[0].id });
    await until(() => row.status === "RUNNING");

    // the CONTROLLER turns on the mark; the ROW is a write behind it, serialized per activity.
    await row.stdin.SIGSTOP();
    specimen.expect(row.controller.status.reflection.code).toBe("PAUSED");
    await until(() => row.status === "PAUSED");
    await row.stdin.SIGCONT();
    await until(() => row.status === "RUNNING");

    const started = performance.now();
    await row.stdin.SIGKILL("operator");
    await streaming;
    specimen.expect(performance.now() - started < 5000).toBe(true);
    await until(() => !world.daemon.entities.activity.$entities.get().some((held) => held.id === row.id));
    specimen.expect(roster.walk(row.id).at(-2)).toBe("ABORTED");
    roster.off();
  });

  specimen.it("a scripted tool round lands as a branch on the row, by path", async () => {
    const roster = ledger(world.daemon.entities.activity);
    const thread = await world.createThread();

    const events = [];
    for await (const packet of await fire(thread, "--tool entity_find --rounds 1 --pace 5ms")) events.push(packet.event);

    await until(() => roster.rows.length);
    const walked = roster.rows.map((frame) => frame.last).filter(Boolean);
    specimen.expect(walked.some((last) => last.startsWith("/hallucination/entity_find"))).toBe(true);
    specimen.expect(events).toContain("/tool/yield");
    specimen.expect(events.at(-1)).toBe("/response/close");
    roster.off();
  });

  specimen.it("a retryable fault is NOTED and retried; only the last one faults the controller", async () => {
    const roster = ledger(world.daemon.entities.activity);
    const thread = await world.createThread();
    const held = [];
    // the backoff is the policy's — two short waits here, so the retries are measured, not endured.
    const packets = await world.dewey.harness.dialogue.stream({
      thread: thread.id,
      parts: [{ type: "text", text: "--fault retryable" }],
      config: { backoff: [10, 20] },
    });
    await until(() => roster.rows.length);
    const row = await world.daemon.entities.activity.findOneOrFail({ id: roster.rows[0].id });
    await (async () => {
      for await (const packet of packets) held.push(packet.event);
    })().catch(() => {});

    const notes = row.steps.filter((step) => step.verb === "note" && step.data?.retry);
    specimen.expect(notes.map((note) => note.data.retry)).toEqual([1, 2]);
    specimen.expect(notes.at(-1).data.message).toContain("scripted retryable fault");
    specimen.expect(roster.walk(row.id)).toContain("FAILED");
    roster.off();
  });
});

specimen.describe("stub · the dock's stop is the row's", () => {
  specimen.it("a send minted under a client id is stopped by ITS row — the sibling on the same thread runs on", async () => {
    const roster = ledger(world.daemon.entities.activity);
    const thread = await world.createThread();
    const id = crypto.randomUUID();
    const rows = () => world.daemon.entities.activity.$entities.get();

    const events = { mine: [], sibling: [] };
    const drainInto = async (key, packets) => {
      for await (const packet of await packets) events[key].push(packet.event);
    };
    const mine = drainInto("mine", world.dewey.harness.dialogue.stream({ thread: thread.id, id, parts: [{ type: "text", text: "--run stalled --pace 40ms" }] }));
    const sibling = drainInto("sibling", world.dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text: "--deltas 4 --stall 600ms" }] }));

    // the dock's match: the row whose turn is the client id the send minted
    await until(() => rows().some((row) => (row.turn?.id ?? row.turn) === id));
    const row = rows().find((held) => (held.turn?.id ?? held.turn) === id);
    specimen.expect(rows().filter((held) => (held.thread?.id ?? held.thread) === thread.id).length).toBe(2);

    await row.stdin.SIGTERM("user pressed stop");
    await mine;
    await sibling;
    specimen.expect(events.mine.at(-1)).toBe("/response/close");
    specimen.expect(roster.walk(row.id).slice(-3)).toEqual(["STOPPING", "STOPPED", "delete"]);
    const other = roster.rows.find((frame) => frame.op === "create" && frame.id !== row.id);
    specimen.expect(roster.walk(other.id)).toEqual(["create", "RUNNING", "DONE", "delete"]);
    specimen.expect(events.sibling.filter((event) => event === "/part/delta").length).toBe(4);
    roster.off();
  });
});
