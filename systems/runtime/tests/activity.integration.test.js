import { specimen, trace } from "@vivalence/typology";
import { metronome } from "@vivalence/typology/scenarios";
import { create, TOOL, OBJECT } from "./scenarios/activity.js";

const { ledger, until, tick } = metronome;

let scenario;
specimen.beforeAll(async () => {
  scenario = await create({ script: [TOOL, OBJECT, { deltas: 9 }] });
});
specimen.afterAll(async () => {
  await scenario.close();
});

const drain = async (stream) => {
  const events = [];
  for await (const packet of await stream) events.push(packet.event);
  return events;
};
async function* frames(chunks) {
  for (const chunk of chunks) yield { event: "/audio/packet", audio: chunk, rate: 16000 };
}

specimen.describe("activity — the row follows the controller", () => {
  specimen.it("a harness stream is one row: born by the harness, held by the client's SIGSTOP, ended by SIGTERM, gone at settle — and nobody else sees it", async () => {
    const { daemon, dewey, clock, connect, fixtures } = scenario;
    const mine = connect(fixtures.user);
    const theirs = connect(fixtures.stranger);
    const roster = ledger(daemon.entities.activity);
    const thread = await scenario.createThread();
    const held = () => daemon.entities.activity.$entities.get();

    const events = [];
    const streaming = (async () => {
      for await (const packet of await dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text: "go" }] })) events.push(packet.event);
    })();
    const deltas = () => events.filter((event) => event === "/part/delta").length;
    await until(() => roster.rows.length);
    const [born] = roster.rows;
    const row = await daemon.entities.activity.findOneOrFail({ id: born.id });
    specimen.expect([row.user.id, row.mode.id, row.thread.id, row.type]).toEqual([fixtures.user.id, dewey.id, thread.id, "HALLUCINATION"]);
    specimen.expect(row.controller.stdout.absolute).toEqual(["hallucination"]);
    const stamped = row.updatedAt;

    clock.release(2);
    await until(() => events.includes("/tool/yield"));
    specimen.expect(row.steps.some((step) => trace.key(step.path) === trace.key(["hallucination", "lookup/c1", "object"]) && step.track === "stop")).toBe(true);
    specimen.expect(row.steps.map((step) => step.path)).toContainEqual(["hallucination", "lookup/c1"]);
    specimen.expect(row.updatedAt > stamped).toBe(true);
    specimen.expect(row.controller.toJSON().children).toEqual([]);
    clock.release(2);
    await until(() => deltas() === 2);

    const activity = mine.branch("/userspace/entities/activity");
    const stdout = [];
    const reading = (async () => {
      for await (const record of activity.stream(`/${row.id}/stdout`)) stdout.push(record);
    })();
    await activity.call(`/${row.id}/stdin/SIGSTOP`);
    specimen.expect(row.status).toBe("PAUSED");
    clock.release(2);
    await tick();
    specimen.expect(deltas()).toBe(2);
    await activity.call(`/${row.id}/stdin/SIGCONT`);
    await until(() => deltas() === 4);
    await activity.call(`/${row.id}/stdin/SIGTERM`, { reason: "user pressed stop" });
    clock.release(1);
    await streaming;
    await until(() => !held().some((entry) => entry.id === row.id));

    specimen.expect(roster.walk(row.id)).toEqual(["create", "RUNNING", "PAUSED", "RUNNING", "STOPPING", "STOPPED", "delete"]);
    specimen.expect(roster.rows.findLast((frame) => frame.id === row.id && frame.op === "update").error).toBe(null);
    specimen.expect(row.controller.status.reflection.reason).toBe("user pressed stop");
    specimen.expect(events.at(-1)).toBe("/response/close");
    await reading;
    specimen.expect(stdout[0]).toMatchObject({ path: ["hallucination"], track: "log", data: { activity: row.id, user: fixtures.user.id, mode: dewey.id, thread: thread.id } });
    specimen.expect(stdout.map((record) => record.track).slice(1, 4)).toEqual(["status", "start", "log"]);
    specimen.expect(stdout.slice(-4)).toMatchObject([
      { path: ["hallucination"], track: "status", data: { code: "RUNNING" } },
      { path: ["hallucination"], track: "status", data: { code: "STOPPING" } },
      { path: ["hallucination"], track: "stop" },
      { path: ["hallucination"], track: "status", data: { code: "STOPPED" } },
    ]);
    specimen.expect(stdout.map((record) => JSON.stringify(record))).toEqual([...new Set(stdout.map((record) => JSON.stringify(record)))]);
    await specimen.expect(activity.call(`/${row.id}/stdout`)).rejects.toThrow();
    specimen.expect((await mine.call("/userspace/entities/activity/find", { where: {} })).length).toBe(0);

    await specimen.expect(theirs.call("/userspace/entities/activity/find", { where: {} })).resolves.toEqual([]);
    const other = await daemon.entities.activity.control({ user: fixtures.user.id, mode: dewey.id });
    await specimen.expect(mine.call("/userspace/entities/activity/find", { where: {} })).resolves.toHaveLength(1);
    await specimen.expect(theirs.call("/userspace/entities/activity/find", { where: {} })).resolves.toEqual([]);
    await specimen.expect(theirs.call(`/userspace/entities/activity/${other.id}/stdin/SIGKILL`)).rejects.toThrow();
    specimen.expect(other.status).toBe("IDLE");
    await specimen.expect(activity.call("/create", { data: {} })).rejects.toThrow();
    await specimen.expect(activity.call("/removeOne", { where: { id: other.id } })).rejects.toThrow();
    await specimen.expect(daemon.entities.activity.create({ id: other.id, user: fixtures.user.id, mode: dewey.id })).rejects.toThrow(/is held/);
    await daemon.entities.activity.updateOne({ id: other.id }, { id: "forged", status: "DONE" });
    specimen.expect(held().find((entry) => entry.id === other.id).status).toBe("DONE");
    other.controller.start();
    other.controller.stop();
    await until(() => !held().some((entry) => entry.id === other.id));
    specimen.expect(roster.walk(other.id)).toEqual(["create", "DONE", "RUNNING", "DONE", "delete"]);
    roster.off();
  });

  specimen.it("a harness transcription is one row too: the transcription and its formatting are children by faculty, and the row settles when the stream drains", async () => {
    const { daemon, dewey, spoken } = scenario;
    const roster = ledger(daemon.entities.activity);
    const thread = await scenario.createThread();
    const held = () => daemon.entities.activity.$entities.get();

    const streaming = drain(dewey.harness.verbatim.stream({ source: frames(["a", "b"]), thread: thread.id }));
    await until(() => roster.rows.length);
    const [born] = roster.rows;
    const row = await daemon.entities.activity.findOneOrFail({ id: born.id });
    specimen.expect(row.controller.stdout.absolute).toEqual(["hallucination"]);
    spoken.release(4);
    const events = await streaming;
    specimen.expect(events).toContain("/verbatim/final");
    specimen.expect(events).toContain("/verbatim/polish");
    await until(() => !held().some((entry) => entry.id === row.id));

    specimen.expect(roster.walk(row.id)).toEqual(["create", "RUNNING", "DONE", "delete"]);
    const paths = row.steps.map((step) => `${step.path.join(" › ")} ${step.track}`);
    specimen.expect(paths).toContain("hallucination › verbatim stop");
    specimen.expect(paths).toContain("hallucination › dialogue stop");
    specimen.expect(paths.slice(-2)).toEqual(["hallucination stop", "hallucination status"]);
    specimen.expect(row.controller.toJSON().children).toEqual([]);
    roster.off();
  });
});
