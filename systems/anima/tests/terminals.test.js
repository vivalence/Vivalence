import { atom } from "nanostores";
import { specimen } from "@vivalence/typology";
import { hydrate, settle } from "../src/app/terminals.js";

const STORAGE_KEY = "viva.terminals";

const roster = () => {
  const $entities = atom([]);
  const $active = atom(null);
  return {
    $entities,
    $active,
    get entities() {
      return $entities.get();
    },
  };
};

const hydrated = (persisted) => {
  const held = globalThis.localStorage.getItem(STORAGE_KEY);
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  const terminals = roster();
  try {
    hydrate({ terminals });
  } finally {
    if (held === null) globalThis.localStorage.removeItem(STORAGE_KEY);
    else globalThis.localStorage.setItem(STORAGE_KEY, held);
  }
  return terminals;
};

const daemon = (findOne) => ({
  slug: "italian",
  status: { is: (code) => code === "healthy", $transient: atom(0) },
  entities: { thread: { findOne }, buffer: { findOne } },
});

const quiet = async () => {
  for (let turn = 0; turn < 8; turn += 1) await new Promise((resolve) => setTimeout(resolve, 0));
};

specimen.describe("terminal.$settling — what a terminal still waits for", () => {
  specimen.it("a persisted thread and buffer are the reading after hydrate", () => {
    const terminals = hydrated([{ id: "settling-both", thread: "3f9c1a", buffer: "b71e04" }]);
    specimen.expect(terminals.entities[0].settling).toEqual({ thread: "3f9c1a", buffer: "b71e04" });
  });

  specimen.it("a persisted buffer alone reads with a null thread", () => {
    const terminals = hydrated([{ id: "settling-buffer", buffer: "b71e04" }]);
    specimen.expect(terminals.entities[0].settling).toEqual({ thread: null, buffer: "b71e04" });
  });

  specimen.it("a terminal persisted empty settles nothing", () => {
    const terminals = hydrated([{ id: "settling-none" }]);
    specimen.expect(terminals.entities[0].settling).toBe(null);
  });

  specimen.it("the reading is never written to the save", () => {
    const terminals = hydrated([{ id: "settling-json", thread: "3f9c1a" }]);
    specimen.expect(Object.keys(terminals.entities[0].toJSON()).sort()).toEqual(["buffer", "dock", "id", "thread"]);
  });

  specimen.it("no healthy daemon leaves the reading as it was", async () => {
    const terminals = hydrated([{ id: "settling-pending", thread: "3f9c1a", buffer: "b71e04" }]);
    const off = settle({ terminals, lighthouse: { $daemons: atom([]) } });
    await quiet();
    off();
    specimen.expect(terminals.entities[0].settling).toEqual({ thread: "3f9c1a", buffer: "b71e04" });
  });

  specimen.it("an entity no daemon holds ends the reading", async () => {
    const terminals = hydrated([{ id: "settling-absent", thread: "3f9c1a", buffer: "b71e04" }]);
    const off = settle({ terminals, lighthouse: { $daemons: atom([daemon(() => Promise.resolve(null))]) } });
    await quiet();
    off();
    specimen.expect(terminals.entities[0].settling).toBe(null);
  });

  specimen.it("an unreachable daemon keeps the reading set", async () => {
    const terminals = hydrated([{ id: "settling-unreachable", thread: "3f9c1a", buffer: "b71e04" }]);
    const off = settle({ terminals, lighthouse: { $daemons: atom([daemon(() => Promise.reject(new Error("socket closed")))]) } });
    await quiet();
    off();
    specimen.expect(terminals.entities[0].settling).toEqual({ thread: "3f9c1a", buffer: "b71e04" });
  });
});
