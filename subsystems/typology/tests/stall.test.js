import { specimen, Stall, Phase } from "@vivalence/typology";
import { atom } from "nanostores";

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

const evictFrom = ($source) => (buffer) =>
  $source.set($source.get().filter((entry) => entry.id !== buffer.id));

const make = ({ source = atom([]), active = atom(null), phase = atom(Phase.INERT), pull, depth } = {}) => {
  const stall = Stall({ source, active, phase, pull, depth });
  return { stall, source, active, phase };
};

specimen.describe("Phase", () => {
  specimen.it("a phase vocabulary is frozen at four", () => {
    specimen.expect(Object.isFrozen(Phase)).toBe(true);
    specimen.expect(Phase.INERT).toBe("inert");
    specimen.expect(Phase.MANUAL).toBe("manual");
    specimen.expect(Phase.CONTINUOUS).toBe("continuous");
    specimen.expect(Phase.ESCORT).toBe("escort");
  });
});

specimen.describe("Stall", () => {
  specimen.it("a stall knows its stores, serializes, and sleeps while inert", async () => {
    const source = atom([]);
    const active = atom(null);
    const phase = atom(Phase.INERT);
    const stall = Stall({ source, active, phase });
    specimen.expect(stall.$phase).toBe(phase);
    specimen.expect(stall.$source).toBe(source);
    specimen.expect(stall.$active).toBe(active);

    const serialized = make({
      source: atom([fakeBuffer("x")]),
      active: atom(fakeBuffer("y")),
      phase: atom(Phase.INERT),
      depth: () => 3,
    }).stall.toJSON();
    specimen.expect(serialized.phase).toBe(Phase.INERT);
    specimen.expect(serialized.active).toBe("y");
    specimen.expect(serialized.items).toEqual(["x"]);
    specimen.expect(serialized.depth).toBe(3);

    const dormant = make({ source: atom([fakeBuffer("a")]), phase: atom(Phase.INERT) });
    dormant.source.set([fakeBuffer("a"), fakeBuffer("b")]);
    specimen.expect(dormant.active.get()).toBe(null);

    const selfReleasing = fakeBuffer("a");
    const untouched = make({ source: atom([selfReleasing]), phase: atom(Phase.INERT) });
    let evicted = false;
    selfReleasing.on.release(() => (evicted = true));
    specimen.expect(untouched.active.get()).toBe(null);
    await selfReleasing.release();
    specimen.expect(evicted).toBe(true);

    const retired = make({ source: atom([]), phase: atom(Phase.MANUAL) });
    retired.phase.set(Phase.INERT);
    retired.source.set([fakeBuffer("late")]);
    specimen.expect(retired.active.get()).toBe(null);
  });

  specimen.it("a cursor advances over the filtered queue and wraps", () => {
    const { stall } = make();
    specimen.expect(stall.only((buffer) => buffer.id === "x")).toBe(stall);

    const wrapping = make({ source: atom([fakeBuffer("a"), fakeBuffer("b")]) });
    wrapping.stall.advance();
    specimen.expect(wrapping.active.get().id).toBe("a");
    wrapping.active.set(wrapping.source.get()[0]);
    wrapping.stall.advance();
    specimen.expect(wrapping.active.get().id).toBe("b");
    wrapping.stall.advance();
    specimen.expect(wrapping.active.get().id).toBe("a");

    const filtered = make({
      source: atom([fakeBuffer("hub", { mode: { slug: "hub" } }), fakeBuffer("c", { mode: { slug: "card" } })]),
    });
    filtered.stall.only((buffer) => buffer.mode?.slug === "card");
    filtered.stall.advance();
    specimen.expect(filtered.active.get().id).toBe("c");
  });

  specimen.it("a manual phase disciplines the cursor", async () => {
    const engaged = make({ source: atom([fakeBuffer("a")]), phase: atom(Phase.MANUAL) });
    specimen.expect(engaged.active.get().id).toBe("a");

    const arriving = make({ phase: atom(Phase.MANUAL) });
    arriving.source.set([fakeBuffer("arrived")]);
    specimen.expect(arriving.active.get().id).toBe("arrived");

    const hub = fakeBuffer("hub", { mode: { slug: "hub" } });
    const scoped = make({
      source: atom([hub, fakeBuffer("c", { mode: { slug: "card" } })]),
      active: atom(hub),
      phase: atom(Phase.MANUAL),
    });
    scoped.stall.only((buffer) => buffer.mode?.slug === "card");
    specimen.expect(scoped.active.get().id).toBe("hub");

    const [first, second, third] = [fakeBuffer("a"), fakeBuffer("b"), fakeBuffer("c")];
    const releasing = make({ source: atom([first, second, third]), phase: atom(Phase.MANUAL) });
    releasing.stall.on.release(evictFrom(releasing.source));
    specimen.expect(releasing.active.get().id).toBe("a");
    await first.release();
    specimen.expect(releasing.active.get().id).toBe("b");
    specimen.expect(releasing.source.get().map((entry) => entry.id)).toEqual(["b", "c"]);

    let pulls = 0;
    const never = make({ phase: atom(Phase.MANUAL), pull: () => pulls++, depth: () => 2 });
    never.source.set([fakeBuffer("a")]);
    specimen.expect(pulls).toBe(0);

    const cleared = make({ source: atom([fakeBuffer("a"), fakeBuffer("b")]), phase: atom(Phase.MANUAL) });
    specimen.expect(cleared.active.get().id).toBe("a");
    cleared.source.set([]);
    specimen.expect(cleared.active.get()).toBe(null);

    const lingeringHub = fakeBuffer("hub", { mode: { slug: "hub" } });
    const lastCard = fakeBuffer("c", { mode: { slug: "card" } });
    const draining = make({
      source: atom([lingeringHub, lastCard]),
      active: atom(lastCard),
      phase: atom(Phase.INERT),
    });
    draining.stall.only((buffer) => buffer.mode?.slug === "card");
    draining.stall.on.release(evictFrom(draining.source));
    draining.phase.set(Phase.MANUAL);
    specimen.expect(draining.active.get().id).toBe("c");
    await lastCard.release();
    specimen.expect(draining.active.get()).toBe(null);
  });

  specimen.it("a continuous phase pulls to depth and refills", async () => {
    let guardedPulls = 0;
    const guardedSource = atom([]);
    const guarded = make({
      source: guardedSource,
      phase: atom(Phase.CONTINUOUS),
      depth: () => 2,
      pull: () => {
        guardedPulls++;
        guardedSource.set([fakeBuffer("x"), fakeBuffer("y")]);
      },
    });
    await Promise.resolve();
    specimen.expect(guardedPulls).toBe(1);
    specimen.expect(guarded.active.get().id).toBe("x");

    let refillingPulls = 0;
    const refillingSource = atom([fakeBuffer("a"), fakeBuffer("b")]);
    const refilling = make({
      source: refillingSource,
      phase: atom(Phase.CONTINUOUS),
      depth: () => 2,
      pull: () => {
        refillingPulls++;
        refillingSource.set([...refillingSource.get(), fakeBuffer(`p${refillingPulls}`)]);
      },
    });
    refilling.stall.on.release(evictFrom(refillingSource));
    await refillingSource.get().find((entry) => entry.id === "a").release();
    await Promise.resolve();
    specimen.expect(refillingPulls).toBeGreaterThan(0);
  });

  specimen.it("an escort walks the queue home and a stale bridge no-ops", async () => {
    const home = fakeBuffer("home", { mode: { slug: "hub" } });
    const card = fakeBuffer("a", { mode: { slug: "card" } });
    const escorting = make({
      source: atom([home, card]),
      active: atom(home),
      phase: atom(Phase.INERT),
    });
    escorting.stall.on.release(evictFrom(escorting.source));
    escorting.stall.only((buffer) => buffer.mode?.slug === "card");
    escorting.phase.set(Phase.ESCORT);
    specimen.expect(escorting.active.get().id).toBe("a");
    await card.release();
    specimen.expect(escorting.active.get().id).toBe("home");

    const bridged = fakeBuffer("a");
    const bridgedSource = atom([bridged]);
    const gated = make({ source: bridgedSource, phase: atom(Phase.CONTINUOUS), depth: () => 5 });
    let bridgeEvicted = false;
    gated.stall.on.release(() => (bridgeEvicted = true));
    gated.phase.set(Phase.INERT);
    await bridged.release();
    specimen.expect(bridgeEvicted).toBe(false);
    specimen.expect(bridgedSource.get()).toEqual([bridged]);
  });
});
