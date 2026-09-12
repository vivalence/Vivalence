import { specimen, RemoteRepository, RemoteEntityManager } from "@vivalence/typology";

class Probe { id; status; }
const stub = (answers) => ({
  url: { absolute: "stub://probe" },
  branch() { return this; },
  call: async (endpoint, body) => answers[endpoint]?.(body) ?? null,
  subscribe: (_, handle, options) => { stub.handle = handle; stub.resumed = options.resumed; return () => {}; },
});

specimen.describe("RemoteRepository — what a virtual leans on", () => {
  specimen.it("an update event mutates the identity-mapped instance in place", async () => {
    const connection = stub({});
    const em = new RemoteEntityManager(connection, { probe: { properties: {}, columns: {} } });
    const repository = em.register("probe", new RemoteRepository(Probe).connect(connection));
    repository.subscribe({}, () => {});
    await stub.handle({ op: "create", entity: { id: "p1", status: "OPEN" } });
    const held = repository.findOneLocal({ id: "p1" });
    await stub.handle({ op: "update", entity: { id: "p1", status: "HOT" } });
    specimen.expect(repository.findOneLocal({ id: "p1" })).toBe(held);
    specimen.expect(held.status).toBe("HOT");
  });
  specimen.it("resumed → find() resync drops ids the daemon no longer answers", async () => {
    const connection = stub({ "/find": () => [{ id: "p2", status: "OPEN" }] });
    const em = new RemoteEntityManager(connection, { probe: { properties: {}, columns: {} } });
    const repository = em.register("probe", new RemoteRepository(Probe).connect(connection));
    repository.subscribe({}, () => {});
    await stub.handle({ op: "create", entity: { id: "p1" } });
    await stub.handle({ op: "create", entity: { id: "p2" } });
    repository.persisted = true;                                              // the drop-on-revalidate arm
    stub.resumed();
    await new Promise((r) => setTimeout(r, 20));
    await repository.revalidating;
    specimen.expect(repository.$entities.get().map((e) => e.id)).toEqual(["p2"]);
  });
});
