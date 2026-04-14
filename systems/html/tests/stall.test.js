import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { Stall, StallStatusEnum } from "../src/typology/prototypes/stall.js";

specimen.describe("StallStatusEnum", () => {
  specimen.it("is frozen with all expected values", () => {
    specimen.expect(Object.isFrozen(StallStatusEnum)).toBe(true);
    specimen.expect(StallStatusEnum.UNINITIALIZED).toBe("<uninitialized>");
    specimen.expect(StallStatusEnum.IDLE).toBe("IDLE");
    specimen.expect(StallStatusEnum.PULLING).toBe("PULLING");
    specimen.expect(StallStatusEnum.EXHAUSTED).toBe("EXHAUSTED");
    specimen.expect(StallStatusEnum.ERROR).toBe("ERROR");
    specimen.expect(StallStatusEnum.CLOSED).toBe("CLOSED");
  });
});

specimen.describe("Stall: construction", () => {
  specimen.it("initial status is UNINITIALIZED", () => {
    const stall = new Stall(atom([]), atom(null));
    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.UNINITIALIZED);
  });

  specimen.it("stores $source and $active references", () => {
    const $source = atom([]);
    const $active = atom(null);
    const stall = new Stall($source, $active);
    specimen.expect(stall.$source).toBe($source);
    specimen.expect(stall.$active).toBe($active);
  });

  specimen.it("$error starts null", () => {
    const stall = new Stall(atom([]), atom(null));
    specimen.expect(stall.$error.get()).toBe(null);
  });
});

specimen.describe("Stall: withPull", () => {
  specimen.it("registers pull handler and transitions to IDLE", () => {
    const stall = new Stall(atom([]), atom(null));
    const handler = async () => ({ condition: "NOMINAL" });
    stall.withPull(handler, 3);
    specimen.expect(stall.handlers.pull).toBe(handler);
    specimen.expect(stall.threshold).toBe(3);
    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.IDLE);
  });

  specimen.it("defaults threshold to 0", () => {
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => ({}));
    specimen.expect(stall.threshold).toBe(0);
  });

  specimen.it("returns self for chaining", () => {
    const stall = new Stall(atom([]), atom(null));
    const result = stall.withPull(async () => ({}));
    specimen.expect(result).toBe(stall);
  });
});

specimen.describe("Stall: advance", () => {
  specimen.it("moves first item from source to active", () => {
    const $source = atom([{ id: "a" }, { id: "b" }]);
    const $active = atom(null);
    const stall = new Stall($source, $active);

    stall.advance();
    specimen.expect($active.get()).toEqual({ id: "a" });
  });

  specimen.it("is no-op when source is empty", () => {
    const $active = atom(null);
    const stall = new Stall(atom([]), $active);

    stall.advance();
    specimen.expect($active.get()).toBe(null);
  });

  specimen.it("does not remove item from source", () => {
    const $source = atom([{ id: "a" }]);
    const stall = new Stall($source, atom(null));

    stall.advance();
    specimen.expect($source.get().length).toBe(1);
  });
});

specimen.describe("Stall: next", () => {
  specimen.it("clears active, advances, and runs hooks", () => {
    const $source = atom([{ id: "a" }, { id: "b" }]);
    const $active = atom({ id: "current" });
    const stall = new Stall($source, $active);
    stall.withPull(async () => ({}));

    const hookCalls = [];
    stall.onNext((prev, active, promise) => hookCalls.push({ prev, active, promise }));

    stall.next("done");

    specimen.expect(hookCalls.length).toBe(1);
    specimen.expect(hookCalls[0].prev).toEqual({ id: "current" });
    specimen.expect(hookCalls[0].active).toEqual({ id: "a" });
    specimen.expect(hookCalls[0].promise).toBe("done");
  });

  specimen.it("is no-op when CLOSED", () => {
    const $active = atom({ id: "current" });
    const stall = new Stall(atom([]), $active);
    stall.$status.set(StallStatusEnum.CLOSED);

    stall.next();
    specimen.expect($active.get()).toEqual({ id: "current" });
  });

  specimen.it("triggers pull when source drops below threshold", async () => {
    const pullCalls = [];
    const $source = atom([]);
    const stall = new Stall($source, atom(null));
    stall.withPull(async () => {
      pullCalls.push(true);
      return { condition: "NOMINAL" };
    }, 5);

    stall.next();
    await new Promise((r) => setTimeout(r, 10));
    specimen.expect(pullCalls.length).toBe(1);
  });
});

specimen.describe("Stall: pull", () => {
  specimen.it("transitions IDLE → PULLING → IDLE on nominal result", async () => {
    const transitions = [];
    const stall = new Stall(atom([]), atom(null));
    stall.$status.subscribe((status) => transitions.push(status));

    stall.withPull(async () => ({ buffers: [{ id: "b1" }], condition: "NOMINAL" }));
    await stall.pull();

    specimen.expect(transitions).toContain(StallStatusEnum.PULLING);
    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.IDLE);
  });

  specimen.it("transitions to EXHAUSTED when no buffers returned", async () => {
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => ({ buffers: [] }));
    await stall.pull();

    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.EXHAUSTED);
  });

  specimen.it("transitions to ERROR and captures error when handler throws", async () => {
    const stall = new Stall(atom([]), atom(null));
    const expected = new Error("network failure");
    stall.withPull(async () => { throw expected; });
    await stall.pull();

    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.ERROR);
    specimen.expect(stall.$error.get()).toBe(expected);
  });

  specimen.it("transitions to ERROR when handler returns error condition", async () => {
    const stall = new Stall(atom([]), atom(null));
    const error = new Error("bad data");
    stall.withPull(async () => ({ condition: "ERROR", error }));
    await stall.pull();

    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.ERROR);
    specimen.expect(stall.$error.get()).toBe(error);
  });

  specimen.it("is no-op when already PULLING", async () => {
    let pullCount = 0;
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => {
      pullCount++;
      await new Promise((r) => setTimeout(r, 50));
      return { condition: "NOMINAL", buffers: [{}] };
    });

    const first = stall.pull();
    const second = stall.pull();
    await Promise.all([first, second]);

    specimen.expect(pullCount).toBe(1);
  });

  specimen.it("is no-op when EXHAUSTED", async () => {
    let pullCount = 0;
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => { pullCount++; return { condition: "NOMINAL", buffers: [{}] }; });
    stall.$status.set(StallStatusEnum.EXHAUSTED);

    await stall.pull();
    specimen.expect(pullCount).toBe(0);
  });

  specimen.it("is no-op when CLOSED", async () => {
    let pullCount = 0;
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => { pullCount++; return { condition: "NOMINAL", buffers: [{}] }; });
    stall.$status.set(StallStatusEnum.CLOSED);

    await stall.pull();
    specimen.expect(pullCount).toBe(0);
  });

  specimen.it("is no-op when ERROR", async () => {
    let pullCount = 0;
    const stall = new Stall(atom([]), atom(null));
    stall.withPull(async () => { pullCount++; return { condition: "NOMINAL", buffers: [{}] }; });
    stall.$status.set(StallStatusEnum.ERROR);

    await stall.pull();
    specimen.expect(pullCount).toBe(0);
  });

  specimen.it("is no-op when source exceeds threshold", async () => {
    let pullCount = 0;
    const stall = new Stall(atom([{ id: 1 }, { id: 2 }, { id: 3 }]), atom(null));
    stall.withPull(async () => { pullCount++; return { condition: "NOMINAL", buffers: [{}] }; }, 2);

    await stall.pull();
    specimen.expect(pullCount).toBe(0);
  });

  specimen.it("is no-op when no handler registered", async () => {
    const stall = new Stall(atom([]), atom(null));
    stall.$status.set(StallStatusEnum.IDLE);
    await stall.pull();
    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.IDLE);
  });
});

specimen.describe("Stall: activate", () => {
  specimen.it("auto-advances when status becomes IDLE with source available", () => {
    const $source = atom([{ id: "a" }]);
    const $active = atom(null);
    const stall = new Stall($source, $active);

    stall.activate();
    stall.withPull(async () => ({}));

    specimen.expect($active.get()).toEqual({ id: "a" });
  });

  specimen.it("auto-advances on source change when no active item", () => {
    const $source = atom([]);
    const $active = atom(null);
    const stall = new Stall($source, $active);
    stall.withPull(async () => ({}));
    stall.activate();

    $source.set([{ id: "arrived" }]);
    specimen.expect($active.get()).toEqual({ id: "arrived" });
  });

  specimen.it("does not advance on source change when CLOSED", () => {
    const $source = atom([]);
    const $active = atom(null);
    const stall = new Stall($source, $active);
    stall.withPull(async () => ({}));
    stall.activate();
    stall.$status.set(StallStatusEnum.CLOSED);

    $source.set([{ id: "arrived" }]);
    specimen.expect($active.get()).toBe(null);
  });

  specimen.it("returns self for chaining", () => {
    const stall = new Stall(atom([]), atom(null));
    specimen.expect(stall.activate()).toBe(stall);
  });
});

specimen.describe("Stall: hooks", () => {
  specimen.it("onNext registers multiple hooks", () => {
    const stall = new Stall(atom([]), atom(null));
    stall.onNext(() => {});
    stall.onNext(() => {});
    specimen.expect(stall.handlers.hooks.length).toBe(2);
  });

  specimen.it("all hooks fire with correct args on next()", () => {
    const $source = atom([{ id: "next" }]);
    const $active = atom({ id: "current" });
    const stall = new Stall($source, $active);
    stall.withPull(async () => ({}));

    const calls = [];
    stall.onNext((prev, active, promise) => calls.push({ hook: 1, prev, active, promise }));
    stall.onNext((prev, active, promise) => calls.push({ hook: 2, prev, active, promise }));

    stall.next("result");

    specimen.expect(calls.length).toBe(2);
    specimen.expect(calls[0].hook).toBe(1);
    specimen.expect(calls[1].hook).toBe(2);
    specimen.expect(calls[0].prev).toEqual({ id: "current" });
    specimen.expect(calls[0].active).toEqual({ id: "next" });
    specimen.expect(calls[0].promise).toBe("result");
  });
});

specimen.describe("Stall: reset", () => {
  specimen.it("clears handlers, active, and sets IDLE", () => {
    const $active = atom({ id: "something" });
    const stall = new Stall(atom([]), $active);
    stall.withPull(async () => ({}));
    stall.onNext(() => {});

    stall.reset();

    specimen.expect(stall.handlers.pull).toBe(null);
    specimen.expect(stall.handlers.hooks.length).toBe(0);
    specimen.expect($active.get()).toBe(null);
    specimen.expect(stall.$status.get()).toBe(StallStatusEnum.IDLE);
  });
});

specimen.describe("Stall: toJSON", () => {
  specimen.it("serializes complete state", () => {
    const $source = atom([{ id: "b1", toJSON() { return { id: "b1" }; } }]);
    const $active = atom({ id: "a1", toJSON() { return { id: "a1" }; } });
    const stall = new Stall($source, $active);
    stall.withPull(async () => ({}), 2);
    stall.onNext(() => {});

    const json = stall.toJSON();
    specimen.expect(json.status).toBe(StallStatusEnum.IDLE);
    specimen.expect(json.active).toEqual({ id: "a1" });
    specimen.expect(json.queue).toEqual([{ id: "b1" }]);
    specimen.expect(json.error).toBe(null);
    specimen.expect(json.hasPull).toBe(true);
    specimen.expect(json.hooks).toBe(1);
  });

  specimen.it("serializes items by id when no toJSON", () => {
    const $source = atom([{ id: "x" }]);
    const $active = atom({ id: "y" });
    const stall = new Stall($source, $active);

    const json = stall.toJSON();
    specimen.expect(json.active).toBe("y");
    specimen.expect(json.queue).toEqual(["x"]);
  });

  specimen.it("serializes error message", () => {
    const stall = new Stall(atom([]), atom(null));
    stall.$error.set(new Error("broken"));

    const json = stall.toJSON();
    specimen.expect(json.error).toBe("broken");
  });
});
