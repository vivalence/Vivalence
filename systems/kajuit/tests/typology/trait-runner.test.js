import { expect } from "jsr:@std/expect";
import { describe, it } from "jsr:@std/testing/bdd";

import { applyTraits } from "../../src/typology/gestalten/belt/runner.js";

describe({
  name: "applyTraits middleware factory",
  sanitizeOps: false,
  sanitizeResources: false,
}, () => {
  it("returns a function", () => {
    expect(typeof applyTraits({})).toBe("function");
  });

  it("calls next() before invoking traits", async () => {
    const order = [];
    const ns = {
      A: () => order.push("A"),
    };
    const middleware = applyTraits(ns);
    await middleware(
      { entity: { id: "e1", traits: ["A"] } },
      async () => order.push("next"),
    );
    expect(order).toEqual(["next", "A"]);
  });

  it("invokes each trait fn with (entity, ctx)", async () => {
    const calls = [];
    const ns = {
      A: (entity, ctx) => calls.push({ trait: "A", id: entity.id, ctx }),
      B: (entity, ctx) => calls.push({ trait: "B", id: entity.id, ctx }),
    };
    const middleware = applyTraits(ns);
    const ctx = { entity: { id: "e1", traits: ["A", "B"] }, daemon: "d1" };

    await middleware(ctx, async () => {});

    expect(calls.length).toBe(2);
    expect(calls[0].trait).toBe("A");
    expect(calls[0].id).toBe("e1");
    expect(calls[0].ctx).toBe(ctx);
    expect(calls[1].trait).toBe("B");
  });

  it("collects function returns as finalizers and runs them after all traits", async () => {
    const order = [];
    const ns = {
      A: () => {
        order.push("A-trait");
        return () => order.push("A-final");
      },
      B: () => {
        order.push("B-trait");
        return () => order.push("B-final");
      },
    };
    const middleware = applyTraits(ns);
    await middleware(
      { entity: { traits: ["A", "B"] } },
      async () => {},
    );
    expect(order).toEqual(["A-trait", "B-trait", "A-final", "B-final"]);
  });

  it("ignores trait names not present in the namespace", async () => {
    const ns = { A: () => "ok" };
    const middleware = applyTraits(ns);
    await middleware(
      { entity: { traits: ["A", "MISSING", "ALSO_MISSING"] } },
      async () => {},
    );
  });

  it("tolerates missing entity.traits (no-op trait pass)", async () => {
    const middleware = applyTraits({ A: () => {} });
    await middleware({ entity: {} }, async () => {});
  });

  it("runs trait functions concurrently, awaiting all", async () => {
    const order = [];
    const ns = {
      A: async () => {
        await new Promise((r) => setTimeout(r, 5));
        order.push("A");
      },
      B: () => order.push("B"),
    };
    const middleware = applyTraits(ns);
    await middleware({ entity: { traits: ["A", "B"] } }, async () => {});
    expect(order).toEqual(["B", "A"]);
  });

  it("awaits async finalizers in order", async () => {
    const order = [];
    const ns = {
      A: () => async () => {
        await new Promise((r) => setTimeout(r, 5));
        order.push("A-final");
      },
      B: () => () => order.push("B-final"),
    };
    const middleware = applyTraits(ns);
    await middleware({ entity: { traits: ["A", "B"] } }, async () => {});
    expect(order).toEqual(["A-final", "B-final"]);
  });
});
