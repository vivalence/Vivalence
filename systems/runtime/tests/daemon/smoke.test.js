import { specimen } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/typology/entities";
import { create } from "../scenarios/daemon.js";

specimen.describe("smoke: full lifecycle", () => {
  let scenario;
  let session;
  let buffers;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("create session via userspace", async () => {
    session = await scenario.authedConn.call("/userspace/entities/session/create", {
      data: {
        mode: scenario.fixtures.mode.id,
        intent: scenario.fixtures.intent.id,
      },
    });
    specimen.expect(session.id).toBeTruthy();
    specimen.expect(session.mode).toBeTruthy();
  });

  specimen.it("emit via HTTP with session → buffers persisted", async () => {
    const result = await scenario.conn.call("/mode/game/flashcard/emit/literal", {
      literal: { id: scenario.fixtures.hello.id },
      session: session.id,
    });
    buffers = result;
    specimen.expect(result.length).toBe(1);
    specimen.expect(result[0].id).toBeTruthy();
    specimen.expect(result[0].data.recall).toBe("LEARNING");
    specimen.expect(result[0].literals).toContain(scenario.fixtures.hello.id);
  });

  specimen.it("query buffers via userspace", async () => {
    const found = await scenario.authedConn.call("/userspace/entities/buffer/find", {
      where: { session: session.id },
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
      session: session.id,
    });
    specimen.expect(result[0].index).toBeGreaterThan(buffers[0].index);
  });

  specimen.it("all buffers ordered by index", async () => {
    const all = await scenario.authedConn.call("/userspace/entities/buffer/find", {
      where: { session: session.id },
    });
    const indexs = all.map((b) => b.index);
    const sorted = [...indexs].sort((a, b) => a - b);
    specimen.expect(indexs).toEqual(sorted);
  });
});

// specimen.describe("smoke (old)", () => {
//   specimen.it("emit via HTTP with session → buffers persisted", async () => {
//     specimen.expect(result[0].props.literal).toEqual({ id: scenario.fixtures.hello.id });
//   });
//   specimen.it("query buffers via userspace", async () => {
//     specimen.expect(match.props.literal).toBeTruthy();
//   });
//   specimen.it("buffer props persisted correctly", async () => {
//     specimen.expect(buffer.props.literal).toEqual({ id: scenario.fixtures.hello.id });
//     specimen.expect(buffer.props.recall).toBe("LEARNING");
//   });
// });
