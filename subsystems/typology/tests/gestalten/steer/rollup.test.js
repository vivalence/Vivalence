import { specimen, steer, v } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";

const { rollup } = steer.trie;

specimen.describe("rollup", () => {
  specimen.describe("collection", () => {
    specimen.it("collects flat effects", () => {
      const vector = new Vector();
      vector.open("ping", () => "pong");
      vector.open("status", () => "ok");

      const entries = rollup(vector);
      specimen.expect(entries.length).toBe(2);
      specimen.expect(entries[0].pattern.nature).toBe("ping");
      specimen.expect(entries[1].pattern.nature).toBe("status");
    });

    specimen.it("collects branched effects", () => {
      const vector = new Vector();
      vector.branch("find").open("literal", () => []);
      vector.branch("find").open("symbol", () => []);
      vector.branch("pick").open("feed", () => []);

      const entries = rollup(vector);
      specimen.expect(entries.length).toBe(3);

      const names = entries.map((e) => e.steps.map((s) => s.nature).join("_"));
      specimen.expect(names).toContain("find_literal");
      specimen.expect(names).toContain("find_symbol");
      specimen.expect(names).toContain("pick_feed");
    });

    specimen.it("collects deeply nested effects", () => {
      const vector = new Vector();
      vector.branch("a").branch("b").open("c", () => "deep");

      const entries = rollup(vector);
      specimen.expect(entries.length).toBe(1);
      specimen.expect(entries[0].steps.map((s) => s.nature)).toEqual(["a", "b", "c"]);
    });

    specimen.it("empty vector returns empty", () => {
      const entries = rollup(new Vector());
      specimen.expect(entries).toEqual([]);
    });
  });

  specimen.describe("callables", () => {
    specimen.it("entries are callable via fn", async () => {
      const vector = new Vector();
      vector.open("greet", () => "hello");

      const [entry] = rollup(vector);
      specimen.expect(await entry.fn()).toBe("hello");
    });

    specimen.it("fn receives input", async () => {
      const vector = new Vector();
      vector.open("echo", (ctx) => ctx.input);

      const [entry] = rollup(vector);
      specimen.expect(await entry.fn("ping")).toBe("ping");
    });

    specimen.it("fn receives arity-2 input", async () => {
      const vector = new Vector();
      vector.open("add", (input, ctx) => input.a + input.b);

      const [entry] = rollup(vector);
      specimen.expect(await entry.fn({ a: 2, b: 3 })).toBe(5);
    });
  });

  specimen.describe("middleware", () => {
    specimen.it("root middleware runs", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => { trace.push("root"); await next(); });
      vector.open("action", () => { trace.push("effect"); return "done"; });

      const [entry] = rollup(vector);
      await entry.fn();
      specimen.expect(trace).toEqual(["root", "effect"]);
    });

    specimen.it("branch middleware accumulates", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => { trace.push("root"); await next(); });
      vector
        .branch("api")
        .use(async (_, next) => { trace.push("branch"); await next(); })
        .open("call", () => { trace.push("leaf"); });

      const [entry] = rollup(vector);
      await entry.fn();
      specimen.expect(trace).toEqual(["root", "branch", "leaf"]);
    });

    specimen.it("context flows through middleware to effect", async () => {
      const vector = new Vector();

      vector.use(async (ctx, next) => { ctx.enriched = true; await next(); });
      vector.branch("api").open("check", (ctx) => ctx.enriched);

      const [entry] = rollup(vector);
      specimen.expect(await entry.fn()).toBe(true);
    });
  });

  specimen.describe("pattern metadata", () => {
    specimen.it("carries input schema from descriptor", () => {
      const vector = new Vector();
      const schema = v.object({ limit: v.integer() });
      vector.open({ nature: "feed", input: schema }, () => []);

      const [entry] = rollup(vector);
      specimen.expect(entry.pattern.input).toBe(schema);
    });

    specimen.it("carries valence from descriptor", () => {
      const vector = new Vector();
      vector.open({ nature: "feed", valence: "fetch items" }, () => []);

      const [entry] = rollup(vector);
      specimen.expect(entry.pattern.valence).toBe("fetch items");
    });

    specimen.it("carries output schema from descriptor", () => {
      const vector = new Vector();
      const output = v.array(v.string());
      vector.open({ nature: "feed", output }, () => []);

      const [entry] = rollup(vector);
      specimen.expect(entry.pattern.output).toBe(output);
    });
  });

  specimen.describe("guarded strategy", () => {
    specimen.it("validates input", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const [entry] = rollup(vector, steer.strategy.guarded);
      specimen.expect(await entry.fn({ limit: 5 })).toBe(5);
    });

    specimen.it("rejects invalid input", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      );

      const [entry] = rollup(vector, steer.strategy.guarded);
      let threw = false;
      try { await entry.fn({ limit: "abc" }); }
      catch (e) { threw = e.code === "VALIDATION"; }
      specimen.expect(threw).toBe(true);
    });

    specimen.it("applies defaults", async () => {
      const vector = new Vector();
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer().default(10) }) },
        (ctx) => ctx.input.limit,
      );

      const [entry] = rollup(vector, steer.strategy.guarded);
      specimen.expect(await entry.fn({})).toBe(10);
    });
  });
});
