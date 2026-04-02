import { specimen, Pool, Yield } from "@vivalence/typology";

const buf = (id) => ({ id, mode: "test" });

specimen.describe("Pool", () => {
  specimen.describe("add — absorption rules", () => {
    specimen.it("keeps raw pojos", () => {
      const pool = new Pool();
      pool.add(buf("a"), buf("b"));
      specimen.expect(pool.items).toHaveLength(2);
      specimen.expect(pool.items[0].id).toBe("a");
    });

    specimen.it("drops null and undefined", () => {
      const pool = Pool.of(buf("a"), null, undefined, buf("b"));
      specimen.expect(pool.items).toHaveLength(2);
    });

    specimen.it("drops false and 0 but keeps them out silently", () => {
      const pool = Pool.of(false, 0, buf("a"));
      specimen.expect(pool.items).toHaveLength(1);
    });

    specimen.it("flattens arrays", () => {
      const pool = Pool.of([buf("a"), buf("b")], buf("c"));
      specimen.expect(pool.items).toHaveLength(3);
    });

    specimen.it("flattens nested arrays", () => {
      const pool = Pool.of([[buf("a")], [buf("b"), [buf("c")]]]);
      specimen.expect(pool.items).toHaveLength(3);
    });

    specimen.it("unwraps NOMINAL yields — extracts buffers", () => {
      const pool = Pool.of(Yield.NOMINAL([buf("a"), buf("b")]));
      specimen.expect(pool.items).toHaveLength(2);
      specimen.expect(pool.items[0].id).toBe("a");
    });

    specimen.it("drops EXHAUSTED yields", () => {
      const pool = Pool.of(buf("a"), Yield.EXHAUSTED(), buf("b"));
      specimen.expect(pool.items).toHaveLength(2);
    });

    specimen.it("drops ERROR yields", () => {
      const pool = Pool.of(buf("a"), Yield.ERROR(new Error("boom")), buf("b"));
      specimen.expect(pool.items).toHaveLength(2);
    });

    specimen.it("nests Pool instances — does not flatten", () => {
      const sub = Pool.of(buf("a"), buf("b"));
      const pool = Pool.of(sub);
      specimen.expect(pool.items).toHaveLength(1);
      specimen.expect(pool.items[0]).toBeInstanceOf(Pool);
    });

    specimen.it("defers promises — keeps as-is", () => {
      const pool = Pool.of(Promise.resolve(buf("a")));
      specimen.expect(pool.items).toHaveLength(1);
      specimen.expect(pool.items[0]).toBeInstanceOf(Promise);
    });

    specimen.it("handles mixed types in one call", () => {
      const pool = Pool.of(
        buf("a"),
        null,
        [buf("b"), buf("c")],
        Yield.NOMINAL([buf("d")]),
        Yield.EXHAUSTED(),
        Pool.of(buf("e")),
        Promise.resolve(buf("f")),
      );
      specimen.expect(pool.items).toHaveLength(6);
      specimen.expect(pool.items[4]).toBeInstanceOf(Pool);
      specimen.expect(pool.items[5]).toBeInstanceOf(Promise);
    });

    specimen.it("chains — add returns this", () => {
      const pool = new Pool();
      const ret = pool.add(buf("a")).add(buf("b"));
      specimen.expect(ret).toBe(pool);
      specimen.expect(pool.items).toHaveLength(2);
    });
  });

  specimen.describe("of", () => {
    specimen.it("static of creates pool with absorbed items", () => {
      const pool = Pool.of(buf("a"), null, [buf("b")]);
      specimen.expect(pool).toBeInstanceOf(Pool);
      specimen.expect(pool.items).toHaveLength(2);
    });

    specimen.it("instance of creates detached pool", () => {
      const parent = Pool.of(buf("a"));
      const child = parent.of(buf("b"), buf("c"));
      specimen.expect(child).toBeInstanceOf(Pool);
      specimen.expect(child.items).toHaveLength(2);
      specimen.expect(parent.items).toHaveLength(1);
    });
  });

  specimen.describe("section", () => {
    specimen.it("creates sub-pool and attaches to parent", () => {
      const pool = new Pool();
      pool.add(buf("a"));
      const sub = pool.section(buf("b"), buf("c"));
      specimen.expect(sub).toBeInstanceOf(Pool);
      specimen.expect(sub.items).toHaveLength(2);
      specimen.expect(pool.items).toHaveLength(2);
      specimen.expect(pool.items[1]).toBe(sub);
    });

    specimen.it("returns sub-pool for chaining apply", () => {
      const pool = new Pool();
      const sub = pool.section(buf("a"), buf("b"), buf("c"));
      const ret = sub.apply((items) => items.reverse());
      specimen.expect(ret).toBe(sub);
      specimen.expect(sub.items[0].id).toBe("c");
    });
  });

  specimen.describe("head", () => {
    specimen.it("prepends items before existing", () => {
      const pool = Pool.of(buf("b"), buf("c"));
      pool.head(buf("a"));
      specimen.expect(pool.items[0].id).toBe("a");
      specimen.expect(pool.items).toHaveLength(3);
    });

    specimen.it("absorbs during prepend — unwraps NOMINAL", () => {
      const pool = Pool.of(buf("b"));
      pool.head(Yield.NOMINAL([buf("a")]));
      specimen.expect(pool.items[0].id).toBe("a");
      specimen.expect(pool.items).toHaveLength(2);
    });
  });

  specimen.describe("apply", () => {
    specimen.it("transforms items with function", () => {
      const pool = Pool.of(buf("a"), buf("b"), buf("c"));
      pool.apply((items) => items.filter((item) => item.id !== "b"));
      specimen.expect(pool.items).toHaveLength(2);
      specimen.expect(pool.items.map((i) => i.id)).toEqual(["a", "c"]);
    });

    specimen.it("returns this for chaining", () => {
      const pool = Pool.of(buf("a"));
      specimen.expect(pool.apply((i) => i)).toBe(pool);
    });
  });

  specimen.describe("flatten", () => {
    specimen.it("returns flat items when no nesting", () => {
      const pool = Pool.of(buf("a"), buf("b"));
      specimen.expect(pool.flatten()).toHaveLength(2);
    });

    specimen.it("recursively flattens nested pools", () => {
      const pool = new Pool();
      pool.add(buf("a"));
      pool.section(buf("b"), buf("c"));
      const flat = pool.flatten();
      specimen.expect(flat).toHaveLength(3);
      specimen.expect(flat.map((i) => i.id)).toEqual(["a", "b", "c"]);
    });

    specimen.it("flattens deeply nested pools", () => {
      const pool = new Pool();
      const sub = pool.section(buf("a"));
      sub.section(buf("b"));
      pool.add(buf("c"));
      specimen.expect(pool.flatten().map((i) => i.id)).toEqual(["a", "b", "c"]);
    });
  });

  specimen.describe("drain", () => {
    specimen.it("returns NOMINAL when pool has items", async () => {
      const pool = Pool.of(buf("a"), buf("b"));
      const result = await pool.drain();
      specimen.expect(result.condition).toBe("NOMINAL");
      specimen.expect(result.buffers).toHaveLength(2);
    });

    specimen.it("returns EXHAUSTED when pool is empty", async () => {
      const result = await new Pool().drain();
      specimen.expect(result.condition).toBe("EXHAUSTED");
      specimen.expect(result.buffers).toEqual([]);
    });

    specimen.it("returns EXHAUSTED when all items were dropped", async () => {
      const pool = Pool.of(null, Yield.EXHAUSTED(), undefined);
      const result = await pool.drain();
      specimen.expect(result.condition).toBe("EXHAUSTED");
    });

    specimen.it("resolves promises to raw pojos", async () => {
      const pool = Pool.of(
        Promise.resolve(buf("a")),
        Promise.resolve(buf("b")),
      );
      const result = await pool.drain();
      specimen.expect(result.condition).toBe("NOMINAL");
      specimen.expect(result.buffers).toHaveLength(2);
      specimen.expect(result.buffers[0].id).toBe("a");
    });

    specimen.it("resolves promises to yield envelopes — unwraps NOMINAL", async () => {
      const pool = Pool.of(
        Promise.resolve(Yield.NOMINAL([buf("a"), buf("b")])),
      );
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(2);
    });

    specimen.it("resolves promises to EXHAUSTED — drops", async () => {
      const pool = Pool.of(
        buf("a"),
        Promise.resolve(Yield.EXHAUSTED()),
      );
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(1);
      specimen.expect(result.buffers[0].id).toBe("a");
    });

    specimen.it("resolves promises to null — drops", async () => {
      const pool = Pool.of(buf("a"), Promise.resolve(null));
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(1);
    });

    specimen.it("resolves promises to arrays — flattens", async () => {
      const pool = Pool.of(Promise.resolve([buf("a"), buf("b")]));
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(2);
    });

    specimen.it("drains nested pools with promises", async () => {
      const pool = new Pool();
      pool.add(buf("a"));
      pool.section(
        Promise.resolve(buf("b")),
        Promise.resolve(buf("c")),
      );
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(3);
      specimen.expect(result.buffers.map((b) => b.id)).toEqual(["a", "b", "c"]);
    });

    specimen.it("drains nested pool that resolves to empty — drops", async () => {
      const pool = new Pool();
      pool.add(buf("a"));
      pool.section(Promise.resolve(null), Promise.resolve(Yield.EXHAUSTED()));
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(1);
    });

    specimen.it("resolves all promises in parallel", async () => {
      const order = [];
      const delayed = (id, ms) => new Promise((r) => setTimeout(() => {
        order.push(id);
        r(buf(id));
      }, ms));
      const pool = Pool.of(delayed("slow", 30), delayed("fast", 10));
      const result = await pool.drain();
      specimen.expect(result.buffers).toHaveLength(2);
      specimen.expect(order).toEqual(["fast", "slow"]);
      specimen.expect(result.buffers[0].id).toBe("slow");
      specimen.expect(result.buffers[1].id).toBe("fast");
    });
  });

  specimen.describe("length", () => {
    specimen.it("counts flat items", () => {
      specimen.expect(Pool.of(buf("a"), buf("b")).length).toBe(2);
    });

    specimen.it("counts through nested pools", () => {
      const pool = new Pool();
      pool.add(buf("a"));
      pool.section(buf("b"), buf("c"));
      specimen.expect(pool.length).toBe(3);
    });
  });

  specimen.describe("composition", () => {
    specimen.it("section + apply — shuffled section preserves order around it", async () => {
      const pool = new Pool();
      pool.add(buf("first"));
      pool.section(buf("a"), buf("b"), buf("c")).apply((items) => items.reverse());
      pool.add(buf("last"));
      const result = await pool.drain();
      specimen.expect(result.buffers[0].id).toBe("first");
      specimen.expect(result.buffers[1].id).toBe("c");
      specimen.expect(result.buffers[3].id).toBe("a");
      specimen.expect(result.buffers[4].id).toBe("last");
    });

    specimen.it("head + section — exhibit before shuffled body", async () => {
      const pool = new Pool();
      pool.section(buf("b"), buf("c"));
      pool.head(buf("a"));
      const result = await pool.drain();
      specimen.expect(result.buffers.map((b) => b.id)).toEqual(["a", "b", "c"]);
    });

    specimen.it("section with deferred promises + apply", async () => {
      const pool = new Pool();
      pool.add(buf("first"));
      pool.section(
        Promise.resolve(Yield.NOMINAL([buf("x")])),
        Promise.resolve(Yield.NOMINAL([buf("y")])),
        Promise.resolve(Yield.NOMINAL([buf("z")])),
      ).apply((items) => items.reverse());
      const result = await pool.drain();
      specimen.expect(result.buffers[0].id).toBe("first");
      specimen.expect(result.buffers[1].id).toBe("z");
      specimen.expect(result.buffers[2].id).toBe("y");
      specimen.expect(result.buffers[3].id).toBe("x");
    });

    specimen.it("nested sections flatten in order", async () => {
      const pool = new Pool();
      pool.add(buf("1"));
      const outer = pool.section(buf("2"));
      outer.section(buf("3"));
      pool.add(buf("4"));
      const result = await pool.drain();
      specimen.expect(result.buffers.map((b) => b.id)).toEqual(["1", "2", "3", "4"]);
    });
  });
});
