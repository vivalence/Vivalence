import { atom } from "nanostores";
import { Dataspace, RemoteRepository, Vector, specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const { subscribed } = ghost.client.lifecycle;

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

class Thread {}
class Terminal {}

const OWNED = {
  beef: { "/userspace/entities/thread": [{ id: "th-beef" }], "/userspace/entities/terminal": [{ id: "t-beef-1" }, { id: "t-beef-2" }] },
  lena: { "/userspace/entities/thread": [{ id: "th-lena" }], "/userspace/entities/terminal": [{ id: "t-lena-1" }] },
};

const world = () => {
  const $user = atom({ slug: "beef" });
  const streams = { opened: 0, closed: 0 };
  const reads = { count: 0 };
  const connection = {
    branch: (path) => ({
      url: { absolute: path },
      call: async (route) => {
        if (route !== "/find") return null;
        reads.count += 1;
        return OWNED[$user.get().slug][path];
      },
      subscribe: () => {
        streams.opened += 1;
        return () => (streams.closed += 1);
      },
    }),
  };
  const entities = new Dataspace({
    runtime: { connection },
    entities: {
      thread: { repository: (dataspace) => new RemoteRepository(Thread).connect(dataspace.runtime.connection.branch("/userspace/entities/thread")), hydration: new Vector() },
      terminal: { repository: (dataspace) => new RemoteRepository(Terminal).connect(dataspace.runtime.connection.branch("/userspace/entities/terminal")), hydration: new Vector() },
    },
    seed: () => {},
  });
  entities.em.schema = {};
  const lighthouse = { $user, get user() { return $user.get(); } };
  const clientDie = { runtime: { lighthouse, entities } };
  const held = Promise.withResolvers();
  const running = subscribed(clientDie, () => held.promise);
  const ids = (name) => entities[name].$entities.get().map((entity) => entity.id);
  return { $user, streams, reads, ids, held, running, entities };
};

specimen.describe("subscribed — the client is no user's: another user's sign-in drops the store and reads theirs into the same atoms", () => {
  specimen.it("another user signs in: every declared entity is dropped, read again under the new user, the streams re-opened; an atom bound at boot holds the new user's", async () => {
    const booted = world();
    await settle();
    const bound = booted.entities.terminal.$entities;
    specimen.expect(booted.ids("terminal")).toEqual(["t-beef-1", "t-beef-2"]);
    specimen.expect(booted.streams).toEqual({ opened: 2, closed: 0 });
    booted.$user.set(null);
    booted.$user.set({ slug: "lena" });
    await settle();
    specimen.expect(booted.ids("thread")).toEqual(["th-lena"]);
    specimen.expect(bound.get().map((entity) => entity.id)).toEqual(["t-lena-1"]);
    specimen.expect(booted.streams).toEqual({ opened: 4, closed: 2 });
    booted.held.resolve();
    await booted.running;
    specimen.expect(booted.streams).toEqual({ opened: 4, closed: 4 });
  });

  specimen.it("a logout, or the same user signing back in, drops nothing", async () => {
    const booted = world();
    await settle();
    booted.$user.set(null);
    booted.$user.set({ slug: "beef" });
    await settle();
    specimen.expect(booted.reads.count).toBe(2);
    specimen.expect(booted.ids("terminal")).toEqual(["t-beef-1", "t-beef-2"]);
    specimen.expect(booted.streams).toEqual({ opened: 2, closed: 0 });
    booted.held.resolve();
    await booted.running;
  });
});
