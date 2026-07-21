import { specimen, Pool, Yield } from "@vivalence/typology";

const buffer = (id) => ({ id, mode: "test" });

specimen.describe("Pool", () => {
  specimen.it("a pool absorbs anything", () => {
    const pool = new Pool();
    const chained = pool.add(buffer("a")).add(buffer("b"));
    specimen.expect(chained).toBe(pool);
    specimen.expect(pool.items).toHaveLength(2);
    specimen.expect(pool.items[0].id).toBe("a");

    specimen.expect(Pool.of(buffer("a"), null, undefined, buffer("b")).items).toHaveLength(2);
    specimen.expect(Pool.of(false, 0, buffer("a")).items).toHaveLength(1);
    specimen.expect(Pool.of([buffer("a"), buffer("b")], buffer("c")).items).toHaveLength(3);
    specimen.expect(Pool.of([[buffer("a")], [buffer("b"), [buffer("c")]]]).items).toHaveLength(3);

    const unwrapped = Pool.of(Yield.NOMINAL([buffer("a"), buffer("b")]));
    specimen.expect(unwrapped.items).toHaveLength(2);
    specimen.expect(unwrapped.items[0].id).toBe("a");
    specimen.expect(Pool.of(buffer("a"), Yield.EXHAUSTED(), buffer("b")).items).toHaveLength(2);
    specimen.expect(Pool.of(buffer("a"), Yield.ERROR(new Error("boom")), buffer("b")).items).toHaveLength(2);

    const nested = Pool.of(Pool.of(buffer("a"), buffer("b")));
    specimen.expect(nested.items).toHaveLength(1);
    specimen.expect(nested.items[0]).toBeInstanceOf(Pool);

    const deferred = Pool.of(Promise.resolve(buffer("a")));
    specimen.expect(deferred.items).toHaveLength(1);
    specimen.expect(deferred.items[0]).toBeInstanceOf(Promise);

    const mixed = Pool.of(
      buffer("a"),
      null,
      [buffer("b"), buffer("c")],
      Yield.NOMINAL([buffer("d")]),
      Yield.EXHAUSTED(),
      Pool.of(buffer("e")),
      Promise.resolve(buffer("f")),
    );
    specimen.expect(mixed.items).toHaveLength(6);
    specimen.expect(mixed.items[4]).toBeInstanceOf(Pool);
    specimen.expect(mixed.items[5]).toBeInstanceOf(Promise);

    const absorbed = Pool.of(buffer("a"), null, [buffer("b")]);
    specimen.expect(absorbed).toBeInstanceOf(Pool);
    specimen.expect(absorbed.items).toHaveLength(2);

    const parent = Pool.of(buffer("a"));
    const detached = parent.of(buffer("b"), buffer("c"));
    specimen.expect(detached).toBeInstanceOf(Pool);
    specimen.expect(detached.items).toHaveLength(2);
    specimen.expect(parent.items).toHaveLength(1);
  });

  specimen.it("a section shapes the tree", () => {
    const pool = new Pool();
    pool.add(buffer("a"));
    const section = pool.section(buffer("b"), buffer("c"));
    specimen.expect(section).toBeInstanceOf(Pool);
    specimen.expect(section.items).toHaveLength(2);
    specimen.expect(pool.items).toHaveLength(2);
    specimen.expect(pool.items[1]).toBe(section);
    specimen.expect(pool.flatten()).toHaveLength(3);
    specimen.expect(pool.flatten().map((item) => item.id)).toEqual(["a", "b", "c"]);
    specimen.expect(pool.length).toBe(3);

    const reversible = new Pool();
    const shuffled = reversible.section(buffer("a"), buffer("b"), buffer("c"));
    const applied = shuffled.apply((items) => items.reverse());
    specimen.expect(applied).toBe(shuffled);
    specimen.expect(shuffled.items[0].id).toBe("c");

    const prepended = Pool.of(buffer("b"), buffer("c"));
    prepended.head(buffer("a"));
    specimen.expect(prepended.items[0].id).toBe("a");
    specimen.expect(prepended.items).toHaveLength(3);

    const absorbing = Pool.of(buffer("b"));
    absorbing.head(Yield.NOMINAL([buffer("a")]));
    specimen.expect(absorbing.items[0].id).toBe("a");
    specimen.expect(absorbing.items).toHaveLength(2);

    const filtered = Pool.of(buffer("a"), buffer("b"), buffer("c"));
    filtered.apply((items) => items.filter((item) => item.id !== "b"));
    specimen.expect(filtered.items).toHaveLength(2);
    specimen.expect(filtered.items.map((item) => item.id)).toEqual(["a", "c"]);
    specimen.expect(filtered.apply((items) => items)).toBe(filtered);

    specimen.expect(Pool.of(buffer("a"), buffer("b")).flatten()).toHaveLength(2);
    specimen.expect(Pool.of(buffer("a"), buffer("b")).length).toBe(2);

    const deep = new Pool();
    const outer = deep.section(buffer("a"));
    outer.section(buffer("b"));
    deep.add(buffer("c"));
    specimen.expect(deep.flatten().map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  specimen.it("a drain settles every promise", async () => {
    const full = await Pool.of(buffer("a"), buffer("b")).drain();
    specimen.expect(full.condition).toBe("NOMINAL");
    specimen.expect(full.entities.buffer).toHaveLength(2);

    const empty = await new Pool().drain();
    specimen.expect(empty.condition).toBe("EXHAUSTED");
    specimen.expect(empty.entities.buffer).toEqual([]);

    specimen.expect((await Pool.of(null, Yield.EXHAUSTED(), undefined).drain()).condition).toBe("EXHAUSTED");

    const resolved = await Pool.of(Promise.resolve(buffer("a")), Promise.resolve(buffer("b"))).drain();
    specimen.expect(resolved.condition).toBe("NOMINAL");
    specimen.expect(resolved.entities.buffer).toHaveLength(2);
    specimen.expect(resolved.entities.buffer[0].id).toBe("a");

    specimen.expect((await Pool.of(Promise.resolve(Yield.NOMINAL([buffer("a"), buffer("b")]))).drain()).entities.buffer).toHaveLength(2);

    const dropped = await Pool.of(buffer("a"), Promise.resolve(Yield.EXHAUSTED())).drain();
    specimen.expect(dropped.entities.buffer).toHaveLength(1);
    specimen.expect(dropped.entities.buffer[0].id).toBe("a");

    specimen.expect((await Pool.of(buffer("a"), Promise.resolve(null)).drain()).entities.buffer).toHaveLength(1);
    specimen.expect((await Pool.of(Promise.resolve([buffer("a"), buffer("b")])).drain()).entities.buffer).toHaveLength(2);

    const nested = new Pool();
    nested.add(buffer("a"));
    nested.section(Promise.resolve(buffer("b")), Promise.resolve(buffer("c")));
    const drained = await nested.drain();
    specimen.expect(drained.entities.buffer).toHaveLength(3);
    specimen.expect(drained.entities.buffer.map((item) => item.id)).toEqual(["a", "b", "c"]);

    const hollow = new Pool();
    hollow.add(buffer("a"));
    hollow.section(Promise.resolve(null), Promise.resolve(Yield.EXHAUSTED()));
    specimen.expect((await hollow.drain()).entities.buffer).toHaveLength(1);

    const order = [];
    const delayed = (id, milliseconds) =>
      new Promise((resolve) =>
        setTimeout(() => {
          order.push(id);
          resolve(buffer(id));
        }, milliseconds)
      );
    const parallel = await Pool.of(delayed("slow", 30), delayed("fast", 10)).drain();
    specimen.expect(parallel.entities.buffer).toHaveLength(2);
    specimen.expect(order).toEqual(["fast", "slow"]);
    specimen.expect(parallel.entities.buffer[0].id).toBe("slow");
    specimen.expect(parallel.entities.buffer[1].id).toBe("fast");
  });

  specimen.it("a composed pool drains in order", async () => {
    const pool = new Pool();
    pool.add(buffer("first"));
    pool.section(buffer("a"), buffer("b"), buffer("c")).apply((items) => items.reverse());
    pool.add(buffer("last"));
    const shuffled = await pool.drain();
    specimen.expect(shuffled.entities.buffer[0].id).toBe("first");
    specimen.expect(shuffled.entities.buffer[1].id).toBe("c");
    specimen.expect(shuffled.entities.buffer[3].id).toBe("a");
    specimen.expect(shuffled.entities.buffer[4].id).toBe("last");

    const exhibit = new Pool();
    exhibit.section(buffer("b"), buffer("c"));
    exhibit.head(buffer("a"));
    specimen.expect((await exhibit.drain()).entities.buffer.map((item) => item.id)).toEqual(["a", "b", "c"]);

    const deferred = new Pool();
    deferred.add(buffer("first"));
    deferred.section(
      Promise.resolve(Yield.NOMINAL([buffer("x")])),
      Promise.resolve(Yield.NOMINAL([buffer("y")])),
      Promise.resolve(Yield.NOMINAL([buffer("z")])),
    ).apply((items) => items.reverse());
    const settled = await deferred.drain();
    specimen.expect(settled.entities.buffer[0].id).toBe("first");
    specimen.expect(settled.entities.buffer[1].id).toBe("z");
    specimen.expect(settled.entities.buffer[2].id).toBe("y");
    specimen.expect(settled.entities.buffer[3].id).toBe("x");

    const ordered = new Pool();
    ordered.add(buffer("1"));
    const outer = ordered.section(buffer("2"));
    outer.section(buffer("3"));
    ordered.add(buffer("4"));
    specimen.expect((await ordered.drain()).entities.buffer.map((item) => item.id)).toEqual(["1", "2", "3", "4"]);
  });
});
