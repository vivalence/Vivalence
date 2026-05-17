import { expect } from "jsr:@std/expect";
import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { atom } from "nanostores";

import { Main } from "../../src/typology/decks/main.js";

function makeTerminals(initial = []) {
  let store = new Map(initial.map((t) => [t.id, t]));
  const $entities = atom([...store.values()]);
  let counter = initial.length;
  return {
    $entities,
    has(id) {
      return store.has(id);
    },
    findOne({ id }) {
      return store.get(id) ?? null;
    },
    all() {
      return [...store.values()];
    },
    async create({ slug = null } = {}) {
      counter += 1;
      const id = `terminal-${counter}`;
      const entity = { id, slug, daemon: null, thread: null };
      store.set(id, entity);
      $entities.set([...store.values()]);
      return entity;
    },
    remove(id) {
      store.delete(id);
      $entities.set([...store.values()]);
    },
    update(id, patch) {
      const entity = store.get(id);
      if (!entity) return null;
      Object.assign(entity, patch);
      $entities.set([...store.values()]);
      return entity;
    },
  };
}

function makeQuarters(initial = []) {
  return { terminals: makeTerminals(initial) };
}

function makeLighthouse(daemons = new Map()) {
  return {
    daemons,
    $daemons: atom([...daemons.values()]),
  };
}

describe({
  name: "Main deck",
  sanitizeOps: false,
  sanitizeResources: false,
}, () => {
  beforeEach(() => {
    globalThis.localStorage = {
      store: new Map(),
      getItem(key) {
        return this.store.get(key) ?? null;
      },
      setItem(key, value) {
        this.store.set(key, String(value));
      },
      removeItem(key) {
        this.store.delete(key);
      },
    };
  });

  it("constructs with no terminals — active is null", () => {
    const quarters = makeQuarters();
    const lighthouse = makeLighthouse();
    const main = new Main(quarters, lighthouse);

    expect(main.active).toBe(null);
    expect(main.terminal).toBe(null);
    expect(main.current).toBe(null);
  });

  it("restoreActive picks first terminal when no localStorage state", () => {
    const quarters = makeQuarters([
      { id: "t1", slug: "alpha" },
      { id: "t2", slug: "beta" },
    ]);
    const main = new Main(quarters, makeLighthouse());

    expect(main.active).toBe("t1");
    expect(main.terminal?.id).toBe("t1");
  });

  it("spawn creates a terminal and sets it active + persists", async () => {
    const quarters = makeQuarters();
    const main = new Main(quarters, makeLighthouse());

    const terminal = await main.spawn("alpha");
    expect(terminal.id).toBe("terminal-1");
    expect(main.active).toBe("terminal-1");
    expect(main.terminal?.id).toBe("terminal-1");
    expect(globalThis.localStorage.getItem("viva.main.terminal")).toBe("terminal-1");
  });

  it("activate sets active when terminal exists", () => {
    const quarters = makeQuarters([{ id: "t1" }, { id: "t2" }]);
    const main = new Main(quarters, makeLighthouse());

    main.activate("t2");
    expect(main.active).toBe("t2");
    expect(main.terminal?.id).toBe("t2");
  });

  it("activate ignores unknown id", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());

    main.activate("ghost");
    expect(main.active).toBe("t1");
  });

  it("close removes terminal and reorients active to remaining", () => {
    const quarters = makeQuarters([{ id: "t1" }, { id: "t2" }]);
    const main = new Main(quarters, makeLighthouse());
    main.activate("t1");

    main.close("t1");
    expect(quarters.terminals.has("t1")).toBe(false);
    expect(main.active).toBe("t2");
  });

  it("close on last terminal sets active null", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    main.close("t1");
    expect(main.active).toBe(null);
  });

  it("daemon and mode getters chain through current thread", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    const fakeDaemon = { slug: "test-daemon" };
    const fakeMode = { slug: "test-mode" };
    const fakeThread = { id: "th1", daemon: fakeDaemon, mode: fakeMode };

    main.$current.set(fakeThread);
    expect(main.daemon).toBe(fakeDaemon);
    expect(main.mode).toBe(fakeMode);
  });

  it("daemon and mode return null when no current thread", () => {
    const quarters = makeQuarters();
    const main = new Main(quarters, makeLighthouse());
    expect(main.daemon).toBe(null);
    expect(main.mode).toBe(null);
  });

  it("set(thread) updates terminal record and current atom", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    const fakeThread = {
      id: "th1",
      daemon: { slug: "dewey" },
      mode: { slug: "brazilian" },
    };
    main.set(fakeThread);

    expect(main.current).toBe(fakeThread);
    const updated = quarters.terminals.findOne({ id: "t1" });
    expect(updated.daemon).toBe("dewey");
    expect(updated.thread).toBe("th1");
  });

  it("clear nulls thread and clears terminal record", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    main.set({ id: "th1", daemon: { slug: "d" }, mode: { slug: "m" } });

    main.clear();
    expect(main.current).toBe(null);
    const updated = quarters.terminals.findOne({ id: "t1" });
    expect(updated.daemon).toBe(null);
    expect(updated.thread).toBe(null);
  });

  it("$current.set runs queue.activate / deactivate hooks", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    const events = [];
    const threadA = { id: "a", queue: { activate: () => events.push("a-act"), deactivate: () => events.push("a-deact") } };
    const threadB = { id: "b", queue: { activate: () => events.push("b-act"), deactivate: () => events.push("b-deact") } };

    main.$current.set(threadA);
    main.$current.set(threadB);
    expect(events).toEqual(["a-act", "a-deact", "b-act"]);
  });

  it("$current.set short-circuits on identity (no double activate)", () => {
    const quarters = makeQuarters([{ id: "t1" }]);
    const main = new Main(quarters, makeLighthouse());
    let activateCount = 0;
    const thread = { id: "x", queue: { activate: () => activateCount++, deactivate: () => {} } };

    main.$current.set(thread);
    main.$current.set(thread);
    expect(activateCount).toBe(1);
  });
});
