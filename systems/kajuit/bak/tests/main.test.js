import { expect } from "jsr:@std/expect";
import { describe, it, beforeEach } from "jsr:@std/testing/bdd";
import { atom } from "nanostores";

import { Main } from "../../src/typology/decks/main.js";

function makeTerminal({ id, slug = null, daemon = null, thread = null } = {}) {
  const $thread = atom(thread);
  return {
    id,
    slug,
    daemon,
    $thread,
    get thread() {
      return $thread.get();
    },
    set thread(value) {
      $thread.set(value);
    },
  };
}

function makeTerminals(initial = []) {
  const store = new Map(initial.map((t) => [t.id, makeTerminal(t)]));
  const $entities = atom([...store.values()]);
  let counter = initial.length;
  return {
    $entities,
    has(id) {
      return store.has(id);
    },
    findOne(id) {
      return store.get(id) ?? null;
    },
    all() {
      return [...store.values()];
    },
    async spawn(slug = null) {
      counter += 1;
      const entity = makeTerminal({ id: `terminal-${counter}`, slug });
      store.set(entity.id, entity);
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
    refresh() {
      $entities.set([...store.values()]);
    },
  };
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

  it("constructs with no terminals — terminal and thread are null", () => {
    const main = new Main(makeTerminals(), makeLighthouse());
    expect(main.terminal).toBe(null);
    expect(main.thread).toBe(null);
  });

  it("restore picks first terminal when no localStorage state", () => {
    const terminals = makeTerminals([
      { id: "t1", slug: "alpha" },
      { id: "t2", slug: "beta" },
    ]);
    const main = new Main(terminals, makeLighthouse());
    expect(main.terminal?.id).toBe("t1");
  });

  it("spawn + activate focuses a fresh terminal and persists", async () => {
    const terminals = makeTerminals();
    const main = new Main(terminals, makeLighthouse());

    const terminal = await terminals.spawn("alpha");
    main.activate(terminal.id);

    expect(main.terminal?.id).toBe("terminal-1");
    expect(globalThis.localStorage.getItem("viva.main.terminal")).toBe("terminal-1");
  });

  it("activate selects terminal when it exists", () => {
    const terminals = makeTerminals([{ id: "t1" }, { id: "t2" }]);
    const main = new Main(terminals, makeLighthouse());

    main.activate("t2");
    expect(main.terminal?.id).toBe("t2");
  });

  it("activate ignores unknown id", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());

    main.activate("ghost");
    expect(main.terminal?.id).toBe("t1");
  });

  it("close removes terminal and reorients to remaining", () => {
    const terminals = makeTerminals([{ id: "t1" }, { id: "t2" }]);
    const main = new Main(terminals, makeLighthouse());
    main.activate("t1");

    main.close("t1");
    expect(terminals.has("t1")).toBe(false);
    expect(main.terminal?.id).toBe("t2");
  });

  it("close on last terminal sets terminal null", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    main.close("t1");
    expect(main.terminal).toBe(null);
  });

  it("daemon and mode getters chain through the active thread", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    const fakeDaemon = { slug: "test-daemon" };
    const fakeMode = { slug: "test-mode" };
    const fakeThread = { id: "th1", daemon: fakeDaemon, mode: fakeMode };

    main.terminal.$thread.set(fakeThread);
    expect(main.thread).toBe(fakeThread);
    expect(main.daemon).toBe(fakeDaemon);
    expect(main.mode).toBe(fakeMode);
  });

  it("daemon and mode return null when no active thread", () => {
    const main = new Main(makeTerminals(), makeLighthouse());
    expect(main.daemon).toBe(null);
    expect(main.mode).toBe(null);
  });

  it("$thread emits only entity threads, never a raw id", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());

    main.terminal.$thread.set("raw-id-string");
    expect(main.thread).toBe(null);
  });

  it("set(thread) writes the terminal record; $thread reflects it", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    const fakeThread = {
      id: "th1",
      daemon: { slug: "dewey" },
      mode: { slug: "brazilian" },
    };
    main.set(fakeThread);

    expect(main.thread).toBe(fakeThread);
    const updated = terminals.findOne("t1");
    expect(updated.daemon).toBe("dewey");
    expect(updated.thread).toBe(fakeThread);
  });

  it("clear nulls thread and clears the terminal record", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    main.set({ id: "th1", daemon: { slug: "d" }, mode: { slug: "m" } });

    main.clear();
    expect(main.thread).toBe(null);
    const updated = terminals.findOne("t1");
    expect(updated.daemon).toBe(null);
    expect(updated.thread).toBe(null);
  });

  it("thread switch runs queue.activate / deactivate hooks", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    const events = [];
    const threadA = { id: "a", queue: { activate: () => events.push("a-act"), deactivate: () => events.push("a-deact") } };
    const threadB = { id: "b", queue: { activate: () => events.push("b-act"), deactivate: () => events.push("b-deact") } };

    main.terminal.$thread.set(threadA);
    main.terminal.$thread.set(threadB);
    expect(events).toEqual(["a-act", "a-deact", "b-act"]);
  });

  it("queue lifecycle short-circuits on identity (no double activate)", () => {
    const terminals = makeTerminals([{ id: "t1" }]);
    const main = new Main(terminals, makeLighthouse());
    let activateCount = 0;
    const thread = { id: "x", queue: { activate: () => activateCount++, deactivate: () => {} } };

    main.terminal.$thread.set(thread);
    main.terminal.$thread.set(thread);
    expect(activateCount).toBe(1);
  });
});
