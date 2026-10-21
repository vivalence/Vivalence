import { Dataspace, RemoteRepository, Vector, specimen } from "@vivalence/typology";

class Thread {}
class Buffer {}
class Literal {}

const ROWS = {
  "/userspace/entities/thread": [{ id: "t1" }],
  "/userspace/entities/buffer": [{ id: "b1", thread: "t1" }],
  "/daemon/spanish/entities/literal": [{ id: "l1" }],
};

const world = (order) => {
  const opened = new Set();
  const branch = (path) => ({
    url: { absolute: path },
    branch: (tail) => branch(`${path}${tail}`),
    call: async (route) => (route === "/find" ? ROWS[path] : null),
    subscribe: () => {
      opened.add(path);
      return () => opened.delete(path);
    },
  });
  const connection = { branch };
  const ENTITIES = {
    thread: { repository: (dataspace) => new RemoteRepository(Thread).connect(dataspace.runtime.connection.branch("/userspace/entities/thread")), hydration: new Vector() },
    buffer: { repository: (dataspace) => new RemoteRepository(Buffer).connect(dataspace.runtime.connection.branch("/userspace/entities/buffer")), hydration: new Vector() },
    literal: { repository: () => new RemoteRepository(Literal), hydration: new Vector() },
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

  specimen.it("a kind registered without a connection is a KIND, not a stream: subscribe skips it", async () => {
    const { dataspace, opened } = world(["thread", "literal"]);
    const off = await dataspace.subscribe();
    specimen.expect([...opened]).toEqual(["/userspace/entities/thread"]);
    off();
  });
});

specimen.describe("Dataspace.branch — connects the named kinds under a host's connection, sharing the dataspace's em", () => {
  specimen.it("branch(connection, [literal]) → one repository on <host>/entities/literal, rows of the registered kind", async () => {
    const { dataspace, opened } = world(["thread", "literal"]);
    const entities = dataspace.branch(dataspace.runtime.connection.branch("/daemon/spanish"), ["literal"]);
    specimen.expect(Object.keys(entities)).toEqual(["literal"]);
    specimen.expect(entities.literal.connection.url.absolute).toBe("/daemon/spanish/entities/literal");
    specimen.expect(entities.literal.entityManager).toBe(dataspace.em);
    const rows = await entities.literal.find();
    specimen.expect(rows[0]).toBeInstanceOf(Literal);
    const off = entities.literal.subscribe();
    specimen.expect([...opened]).toEqual(["/daemon/spanish/entities/literal"]);
    off();
  });

  specimen.it("a kind the dataspace never registered throws at branch, never an undefined at a reader", () => {
    const { dataspace } = world(["thread"]);
    specimen.expect(() => dataspace.branch(dataspace.runtime.connection.branch("/daemon/spanish"), ["literal"])).toThrow();
  });
});
