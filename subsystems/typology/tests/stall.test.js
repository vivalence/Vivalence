import { specimen, Stall, Phase } from "@vivalence/typology";
import { atom } from "nanostores";

// minimal buffer double — id + the release hook surface the Stall relays through.
function fakeBuffer(id, extra = {}) {
  const hooks = [];
  return {
    id,
    hooks: { release: hooks },
    on: {
      release(callback) {
        hooks.push(callback);
        return this;
      },
    },
    release() {
      for (const hook of hooks) hook();
    },
    ...extra,
  };
}

// the eviction hook a STALL-driven phase fires on release — removes the buffer from a
// source atom, exactly as the terminal's stall.on.release does against the dataspace.
const evictFrom = ($source) => (buffer) =>
  $source.set($source.get().filter((x) => x.id !== buffer.id));

// the new Stall reads its phase from a thread-owned atom; drive it with phase.set().
const make = ({ source = atom([]), active = atom(null), phase = atom(Phase.INERT), pull, depth } = {}) => {
  const stall = Stall({ source, active, phase, pull, depth });
  return { stall, source, active, phase };
};

specimen.describe("Phase", () => {
  specimen.it("is frozen with the four phases", () => {
    specimen.expect(Object.isFrozen(Phase)).toBe(true);
    specimen.expect(Phase.INERT).toBe("inert");
    specimen.expect(Phase.MANUAL).toBe("manual");
    specimen.expect(Phase.CONTINUOUS).toBe("continuous");
    specimen.expect(Phase.ESCORT).toBe("escort");
  });
});

specimen.describe("Stall: construction", () => {
  specimen.it("exposes its stores and reads phase live", () => {
    const source = atom([]);
    const active = atom(null);
    const phase = atom(Phase.INERT);
    const stall = Stall({ source, active, phase });
    specimen.expect(stall.$phase).toBe(phase);
    specimen.expect(stall.$source).toBe(source);
    specimen.expect(stall.$active).toBe(active);
  });

  specimen.it("does nothing while inert — no observation, cursor untouched", () => {
    const { active, source } = make({ source: atom([fakeBuffer("a")]), phase: atom(Phase.INERT) });
    source.set([fakeBuffer("a"), fakeBuffer("b")]); // a tick under inert
    specimen.expect(active.get()).toBe(null);
  });
});

specimen.describe("Stall: only / advance", () => {
  specimen.it("only() sets the filter and chains", () => {
    const { stall } = make();
    specimen.expect(stall.only((b) => b.id === "x")).toBe(stall);
  });

  specimen.it("advance wraps the cursor over filtered items", () => {
    const { stall, source, active } = make({ source: atom([fakeBuffer("a"), fakeBuffer("b")]) });
    stall.advance();
    specimen.expect(active.get().id).toBe("a");
    active.set(source.get()[0]);
    stall.advance();
    specimen.expect(active.get().id).toBe("b");
    stall.advance();
    specimen.expect(active.get().id).toBe("a"); // wraps
  });

  specimen.it("advance ignores filtered-out buffers", () => {
    const source = atom([fakeBuffer("hub", { mode: { slug: "hub" } }), fakeBuffer("c", { mode: { slug: "card" } })]);
    const { stall, active } = make({ source });
    stall.only((b) => b.mode?.slug === "card");
    stall.advance();
    specimen.expect(active.get().id).toBe("c");
  });
});

specimen.describe("Stall: manual (cursor discipline)", () => {
  specimen.it("auto-focuses the first item on engage", () => {
    const { active } = make({ source: atom([fakeBuffer("a")]), phase: atom(Phase.MANUAL) });
    specimen.expect(active.get().id).toBe("a");
  });

  specimen.it("auto-focuses when a buffer arrives", () => {
    const { source, active } = make({ phase: atom(Phase.MANUAL) });
    source.set([fakeBuffer("arrived")]);
    specimen.expect(active.get().id).toBe("arrived");
  });

  specimen.it("leaves a filtered-out active alone (only scopes the queue, not the cursor)", () => {
    const hub = fakeBuffer("hub", { mode: { slug: "hub" } });
    const source = atom([hub, fakeBuffer("c", { mode: { slug: "card" } })]);
    const active = atom(hub);
    const { stall } = make({ source, active, phase: atom(Phase.MANUAL) });
    stall.only((b) => b.mode?.slug === "card");
    specimen.expect(active.get().id).toBe("hub"); // present in source → not seized
  });

  specimen.it("release advances to the IMMEDIATE next and the hook evicts", async () => {
    const [a, b, c] = [fakeBuffer("a"), fakeBuffer("b"), fakeBuffer("c")];
    const source = atom([a, b, c]);
    const { stall, active } = make({ source, phase: atom(Phase.MANUAL) });
    stall.on.release(evictFrom(source));
    specimen.expect(active.get().id).toBe("a");
    await a.release();
    specimen.expect(active.get().id).toBe("b"); // b, not c — no double-advance
    specimen.expect(source.get().map((x) => x.id)).toEqual(["b", "c"]);
  });

  specimen.it("never pulls", async () => {
    let pulls = 0;
    const { source } = make({ phase: atom(Phase.MANUAL), pull: () => pulls++, depth: () => 2 });
    source.set([fakeBuffer("a")]);
    specimen.expect(pulls).toBe(0);
  });

  specimen.it("drops the active pointer when the source is bulk-cleared", () => {
    const source = atom([fakeBuffer("a"), fakeBuffer("b")]);
    const { active } = make({ source, phase: atom(Phase.MANUAL) });
    specimen.expect(active.get().id).toBe("a"); // auto-focused
    source.set([]); // clear all buffers at once
    specimen.expect(active.get()).toBe(null); // active is not stranded on a deleted buffer
  });

  specimen.it("clears the cursor after the last filtered card is evicted, even with a filtered-out hub still in source", async () => {
    const hub = fakeBuffer("hub", { mode: { slug: "hub" } });
    const card = fakeBuffer("c", { mode: { slug: "card" } });
    const source = atom([hub, card]);
    const active = atom(card);
    const phase = atom(Phase.INERT);
    const { stall } = make({ source, active, phase });
    stall.only((b) => b.mode?.slug === "card");
    stall.on.release(evictFrom(source));
    phase.set(Phase.MANUAL); // engage on the card (the only filtered item)
    specimen.expect(active.get().id).toBe("c");
    await card.release(); // evict it; the hub remains in source but filtered out
    specimen.expect(active.get()).toBe(null); // the evicted card must not stay rendered
  });
});

specimen.describe("Stall: continuous", () => {
  specimen.it("fetches when below depth and stops at depth (guarded against a stampede)", async () => {
    let pulls = 0;
    const source = atom([]);
    const { active } = make({
      source,
      phase: atom(Phase.CONTINUOUS),
      depth: () => 2,
      pull: () => {
        pulls++;
        source.set([fakeBuffer("x"), fakeBuffer("y")]);
      },
    });
    await Promise.resolve();
    specimen.expect(pulls).toBe(1);
    specimen.expect(active.get().id).toBe("x");
  });

  specimen.it("release advances, evicts, then re-fetches below depth", async () => {
    let pulls = 0;
    const source = atom([fakeBuffer("a"), fakeBuffer("b")]);
    const { stall } = make({
      source,
      phase: atom(Phase.CONTINUOUS),
      depth: () => 2,
      pull: () => {
        pulls++;
        source.set([...source.get(), fakeBuffer(`p${pulls}`)]);
      },
    });
    stall.on.release(evictFrom(source));
    await source.get().find((x) => x.id === "a").release();
    await Promise.resolve();
    specimen.expect(pulls).toBeGreaterThan(0);
  });
});

specimen.describe("Stall: inert (the app/target owns release)", () => {
  specimen.it("never seizes the cursor and release no-ops through the stall", async () => {
    const a = fakeBuffer("a");
    const { active } = make({ source: atom([a]), phase: atom(Phase.INERT) });
    let evicted = false;
    a.on.release(() => (evicted = true)); // the target wires its own release
    specimen.expect(active.get()).toBe(null);
    await a.release();
    specimen.expect(evicted).toBe(true); // the target's own hook fired
  });
});

specimen.describe("Stall: escort", () => {
  specimen.it("seizes from home, walks the queue, then returns home (no fetch)", async () => {
    const home = fakeBuffer("home", { mode: { slug: "hub" } });
    const a = fakeBuffer("a", { mode: { slug: "card" } });
    const source = atom([home, a]);
    const active = atom(home);
    const phase = atom(Phase.INERT); // configure under inert, then engage once
    const { stall } = make({ source, active, phase });
    stall.on.release(evictFrom(source));
    stall.only((b) => b.mode?.slug === "card");
    phase.set(Phase.ESCORT); // single engage: home captured = the launch buffer
    specimen.expect(active.get().id).toBe("a"); // seized into the queue from home
    await a.release();
    specimen.expect(active.get().id).toBe("home"); // queue drained → back home
  });
});

specimen.describe("Stall: live-phase dispatch", () => {
  specimen.it("a release bridge wired under CONTINUOUS no-ops once the phase is INERT", async () => {
    const a = fakeBuffer("a");
    const source = atom([a]);
    const { stall, phase } = make({ source, phase: atom(Phase.CONTINUOUS), depth: () => 5 });
    let evicted = false;
    stall.on.release(() => (evicted = true));
    phase.set(Phase.INERT); // swap — the bridge persists but release() is phase-gated
    await a.release();
    specimen.expect(evicted).toBe(false); // INERT → release relay returns early
    specimen.expect(source.get()).toEqual([a]);
  });
});

specimen.describe("Stall: lifecycle", () => {
  specimen.it("inert tears down observation", () => {
    const source = atom([]);
    const { stall, active, phase } = make({ source, phase: atom(Phase.MANUAL) });
    phase.set(Phase.INERT);
    source.set([fakeBuffer("late")]);
    specimen.expect(active.get()).toBe(null); // no longer observing
  });
});

specimen.describe("Stall: toJSON", () => {
  specimen.it("serializes phase, active, items, depth", () => {
    const source = atom([fakeBuffer("x")]);
    const active = atom(fakeBuffer("y"));
    const { stall } = make({ source, active, phase: atom(Phase.INERT), depth: () => 3 });
    const json = stall.toJSON();
    specimen.expect(json.phase).toBe(Phase.INERT);
    specimen.expect(json.active).toBe("y");
    specimen.expect(json.items).toEqual(["x"]);
    specimen.expect(json.depth).toBe(3);
  });
});
