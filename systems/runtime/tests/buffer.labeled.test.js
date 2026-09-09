import { fromm, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/runtime";
import * as skills from "../daemon/skills/index.js";
import { create } from "./scenarios/cortex.js";

// every buffer is LABELED: a row that claims the trait is left alone; one that does not is named
// structurally — the mode's slug and the seat number — and claims it. the subscriber never reads
// data: what a payload calls its title is the interface's business, not the row's.

let scenario;

const reload = (em, id) => em.fork().findOneOrFail(BufferEntity, { id });

const invoke = async (daemon, name, input) =>
  fromm.yield(
    await steer.dispatch.invoke(
      new Vector().slurp(skills.buffer).use(shard.context.bind("daemon", daemon)),
      new ToolCall(name).signal,
      steer.strategy.guarded,
    )(input),
  );

specimen.describe("buffer — LABELED at create", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("a label handed in is kept whole and the trait claimed", async () => {
    const { em, fixtures, createThread } = scenario;
    const thread = await createThread();
    const row = em.create(BufferEntity, {
      mode: fixtures.dewey,
      thread,
      data: { title: "ignored" },
      traits: ["LABELED"],
      trait: { LABELED: { name: "Flamingo", description: "six species" } },
    });
    await em.flush();

    const stored = await reload(em, row.id);
    specimen.expect(stored.traits).toEqual(["LABELED"]);
    specimen.expect(stored.trait.LABELED).toEqual({
      name: "Flamingo",
      description: "six species",
    });
  });

  specimen.it("no label → the mode's slug and the index; data is never read", async () => {
    const { em, fixtures, createThread } = scenario;
    const thread = await createThread();
    const row = em.create(BufferEntity, {
      mode: fixtures.dewey,
      thread,
      data: { title: "Marginalia", summary: "an index of the small web" },
    });
    await em.flush();

    const stored = await reload(em, row.id);
    specimen.expect(stored.traits).toEqual(["LABELED"]);
    specimen.expect(stored.trait.LABELED).toEqual({ name: "dewey #0" });
  });

  specimen.it("the repository's create is the ONE mint: a thread id binds and takes the next seat", async () => {
    const { em, daemon, fixtures, createThread } = scenario;
    const thread = await createThread();
    const first = await daemon.entities.buffer.create({ mode: fixtures.dewey.id, thread: thread.id });
    const second = await daemon.entities.buffer.create({ mode: fixtures.dewey.id, thread: thread.id });
    await em.flush();

    specimen.expect([first.index, second.index]).toEqual([0, 1]);
    specimen.expect(thread.counter).toBe(2);
    const stored = await Promise.all([reload(em, first.id), reload(em, second.id)]);
    specimen.expect(stored.map((row) => row.trait.LABELED)).toEqual([{ name: "dewey #0" }, { name: "dewey #1" }]);
  });

  specimen.it("no label at all, an explicit index → the mode's slug and that index", async () => {
    const { em, fixtures, createThread } = scenario;
    const thread = await createThread();
    const row = em.create(BufferEntity, {
      mode: fixtures.dewey.id,
      thread,
      index: 3,
      data: {},
    });
    await em.flush();

    const stored = await reload(em, row.id);
    specimen.expect(stored.trait.LABELED).toEqual({ name: "dewey #3" });
  });

  specimen.it("buffer_label — the standard skill — replaces the label whole", async () => {
    const { em, daemon, fixtures, createThread } = scenario;
    const thread = await createThread();
    const row = await daemon.entities.buffer.create({ mode: fixtures.dewey.id, thread: thread.id });
    await em.flush();

    const named = await invoke(daemon, "buffer_label", {
      id: row.id,
      label: { name: "Flamingo", description: "six species" },
    });
    specimen.expect(named.condition).toBe("NOMINAL");
    specimen.expect(named.output.message).toBe('labeled "Flamingo"');
    specimen.expect((await reload(em, row.id)).trait.LABELED).toEqual({
      name: "Flamingo",
      description: "six species",
    });

    await specimen.expect(invoke(daemon, "buffer_label", { id: row.id, label: {} })).rejects.toThrow(
      "required properties name",
    );
  });
});
