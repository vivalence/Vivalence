import { Dataspace, RemoteRepository, Vector, specimen } from "@vivalence/typology";

class Thread {}
class Buffer {}

const ROWS = {
  "/userspace/entities/thread": [{ id: "t1" }],
  "/userspace/entities/buffer": [{ id: "b1", thread: "t1" }],
};

const world = (order) => {
  const opened = new Set();
  const connection = {
    branch: (path) => ({
      url: { absolute: path },
      call: async (route) => (route === "/find" ? ROWS[path] : null),
      subscribe: () => {
        opened.add(path);
        return () => opened.delete(path);
      },
    }),
  };
  const ENTITIES = {
    thread: { repository: (dataspace) => new RemoteRepository(Thread).connect(dataspace.runtime.connection.branch("/userspace/entities/thread")), hydration: new Vector() },
    buffer: { repository: (dataspace) => new RemoteRepository(Buffer).connect(dataspace.runtime.connection.branch("/userspace/entities/buffer")), hydration: new Vector() },
  };
  const dataspace = new Dataspace({ runtime: { connection }, entities: Object.fromEntries(order.map((name) => [name, ENTITIES[name]])), seed: () => {} });
  dataspace.em.schema = { buffer: { properties: { thread: { kind: "m:1", target: "thread" } } } };
  return { dataspace, opened };
};

specimen.describe("Dataspace.subscribe — reads every declared entity in the declared order, then subscribes each; the off closes them all", () => {
  specimen.it("declared thread before buffer: the buffer's thread resolves to the Thread, both streams open, the off closes both", async () => {
    const { dataspace, opened } = world(["thread", "buffer"]);
    const off = await dataspace.subscribe();
    specimen.expect(dataspace.buffer.$entities.get()[0].thread).toBeInstanceOf(Thread);
    specimen.expect([...opened]).toEqual(["/userspace/entities/thread", "/userspace/entities/buffer"]);
    off();
    specimen.expect([...opened]).toEqual([]);
  });

  specimen.it("declared buffer before thread: the buffer's thread stays the id — the declaration IS the read order", async () => {
    const { dataspace } = world(["buffer", "thread"]);
    await dataspace.subscribe();
    specimen.expect(dataspace.buffer.$entities.get()[0].thread).toBe("t1");
  });
});
