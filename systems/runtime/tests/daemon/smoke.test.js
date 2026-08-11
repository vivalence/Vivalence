import { specimen } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/runtime";
import { create } from "../scenarios/daemon.js";

specimen.describe("smoke: full lifecycle", () => {
  let scenario;
  let thread;
  let buffers;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("create thread via userspace", async () => {
    thread = await scenario.authedConn.call("/userspace/entities/thread/create", {
      data: {
        mode: scenario.fixtures.mode.id,
        intent: scenario.fixtures.intent.id,
      },
    });
    specimen.expect(thread.id).toBeTruthy();
    specimen.expect(thread.mode).toBeTruthy();
  });

  specimen.it("emit via HTTP with thread → buffers persisted", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      thread: thread.id,
    });
    specimen.expect(result.condition).toBe("NOMINAL");
    buffers = result.output.buffer;
    specimen.expect(buffers).toHaveLength(1);
    specimen.expect(buffers[0].id).toBeTruthy();
    specimen.expect(buffers[0].data.recall).toBe("LEARNING");
    specimen.expect(buffers[0].literals.map((l) => l.id)).toContain(scenario.fixtures.hello.id);
  });

  specimen.it("query buffers via userspace", async () => {
    const found = await scenario.authedConn.call("/userspace/entities/buffer/find", {
      where: { thread: thread.id },
    });
    specimen.expect(found.length).toBeGreaterThan(0);
    const match = found.find((b) => b.id === buffers[0].id);
    specimen.expect(match).toBeTruthy();
    specimen.expect(match.data).toBeTruthy();
  });

  specimen.it("buffer data persisted correctly", async () => {
    const buffer = await scenario.em.findOne(BufferEntity, { id: buffers[0].id }, { populate: ["literals"] });
    specimen.expect(buffer.data.recall).toBe("LEARNING");
    specimen.expect(buffer.literals.getItems()).toHaveLength(1);
  });

  specimen.it("second emit increments index", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.goodbye.id },
      thread: thread.id,
    });
    specimen.expect(result.condition).toBe("NOMINAL");
    specimen.expect(result.output.buffer[0].index).toBeGreaterThan(buffers[0].index);
  });

  specimen.it("all buffers ordered by index", async () => {
    const all = await scenario.authedConn.call("/userspace/entities/buffer/find", {
      where: { thread: thread.id },
    });
    const indexs = all.map((b) => b.index);
    const sorted = [...indexs].sort((a, b) => a - b);
    specimen.expect(indexs).toEqual(sorted);
  });
});
