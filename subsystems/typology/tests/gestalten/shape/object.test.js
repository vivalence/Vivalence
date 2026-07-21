import { specimen, v, Vector, shape, steer } from "@vivalence/typology";

specimen.describe("object shape", () => {
  specimen.it("a vector compiles effects into a nested callable surface", async () => {
    const vector = new Vector();
    vector.open("greet", () => "hello");
    vector.open("add", (ctx) => ctx.input.a + ctx.input.b);
    vector.open("mul", (ctx) => ctx.input.a * ctx.input.b);
    vector.branch("lorem").open("ipsum", () => "deep");
    vector.branch("a").branch("b").open("c", async () => 42);
    vector.branch("left").open("go", () => "L");
    vector.branch("right").open("go", () => "R");

    const output = shape.object(vector);
    specimen.expect(await output.greet()).toBe("hello");
    specimen.expect(await output.add({ a: 2, b: 3 })).toBe(5);
    specimen.expect(await output.mul({ a: 2, b: 3 })).toBe(6);
    specimen.expect(await output.lorem.ipsum()).toBe("deep");
    specimen.expect(await output.a.b.c()).toBe(42);
    specimen.expect(await output.left.go()).toBe("L");
    specimen.expect(await output.right.go()).toBe("R");
  });

  specimen.it("middleware wraps effects and accumulates down branches", async () => {
    const wrapTrace = [];
    const wrapping = new Vector();
    wrapping.use(async (_, next) => { wrapTrace.push("before"); await next(); wrapTrace.push("after"); });
    wrapping.open("action", () => wrapTrace.push("effect"));
    await shape.object(wrapping).action();
    specimen.expect(wrapTrace).toEqual(["before", "effect", "after"]);

    const branchTrace = [];
    const nested = new Vector();
    nested.use(async (_, next) => { branchTrace.push("root"); await next(); });
    nested.branch("api")
      .use(async (_, next) => { branchTrace.push("branch"); await next(); })
      .open("call", () => branchTrace.push("leaf"));
    await shape.object(nested).api.call();
    specimen.expect(branchTrace).toEqual(["root", "branch", "leaf"]);

    const enriching = new Vector();
    enriching.use(async (ctx, next) => { ctx.enriched = true; await next(); });
    enriching.open("check", (ctx) => ({ enriched: ctx.enriched }));
    specimen.expect(await shape.object(enriching).check()).toEqual({ enriched: true });
  });

  specimen.it("a carry strategy drives execution and composes with branch middleware", async () => {
    const passthrough =
      (apply, effect) =>
      async (ctx = {}) => {
        let result;
        await apply(ctx, async (inner) => { result = await effect(inner); });
        return result;
      };
    const bare = new Vector();
    bare.open("greet", () => "hello");
    specimen.expect(await shape.object(bare, passthrough).greet()).toBe("hello");

    const trace = [];
    const composed = new Vector();
    composed.use(async (ctx, next) => { trace.push("root"); ctx.daemon = { name: "d" }; await next(); });
    composed.branch("api")
      .use(async (_, next) => { trace.push("branch"); await next(); })
      .open("info", (ctx) => ctx.daemon.name);
    specimen.expect(await shape.object(composed).api.info()).toBe("d");
    specimen.expect(trace).toEqual(["root", "branch"]);
  });
});

specimen.describe("guarded strategy", () => {
  specimen.it("a guarded leaf validates input and fills defaults", async () => {
    const vector = new Vector();
    vector.open(
      { nature: "/feed", input: v.object({ limit: v.integer() }) },
      (ctx) => ctx.input.limit,
    );
    const output = shape.object(vector, steer.strategy.guarded);
    specimen.expect(await output.feed({ limit: 5 })).toBe(5);

    let threw = false;
    try { await output.feed({ limit: "abc" }); }
    catch (error) { threw = error.code === "VALIDATION"; }
    specimen.expect(threw).toBe(true);

    const defaulted = new Vector();
    defaulted.open(
      { nature: "/feed", input: v.object({ limit: v.integer().default(10) }) },
      (ctx) => ctx.input.limit,
    );
    specimen.expect(await shape.object(defaulted, steer.strategy.guarded).feed({})).toBe(10);
  });

  specimen.it("a guarded branch validates its schema before the leaf", async () => {
    const vector = new Vector();
    vector
      .branch({ nature: "/emit", input: v.object({ thread: v.string() }) })
      .open(
        { nature: "/literal", input: v.object({ literal: v.string() }) },
        (ctx) => ctx.input.literal,
      );
    const output = shape.object(vector, steer.strategy.guarded);
    specimen.expect(await output.emit.literal({ thread: "t1", literal: "hello" })).toBe("hello");

    const strict = new Vector();
    strict
      .branch({ nature: "/emit", input: v.object({ thread: v.string() }) })
      .open("/literal", (ctx) => ctx.input);
    const strictOutput = shape.object(strict, steer.strategy.guarded);
    let threw = false;
    try { await strictOutput.emit.literal({ thread: { nested: 1 } }); }
    catch (error) { threw = error.code === "VALIDATION"; }
    specimen.expect(threw).toBe(true);
  });

  specimen.it("the direct strategy opts out of validation", async () => {
    const vector = new Vector();
    vector.open(
      { nature: "/feed", input: v.object({ limit: v.integer() }) },
      (ctx) => "ok",
    );
    const output = shape.object(vector, steer.strategy.direct);
    specimen.expect(await output.feed({ limit: "not a number" })).toBe("ok");
  });
});

specimen.describe("proxy shape", () => {
  specimen.it("a proxy resolves literals and captures parameters", async () => {
    const literals = new Vector();
    literals.open("greet", () => "hello");
    literals.branch("api").open("status", () => "ok");
    const literalOutput = shape.proxy(literals);
    specimen.expect(await literalOutput.greet()).toBe("hello");
    specimen.expect(await literalOutput.api.status()).toBe("ok");

    const users = new Vector();
    const branch = users.branch("users");
    branch.open("me", () => "self");
    branch.open(":id", (ctx) => ctx.params.id);
    const userOutput = shape.proxy(users);
    specimen.expect(await userOutput.users.me()).toBe("self");
    specimen.expect(await userOutput.users.john()).toBe("john");
    specimen.expect(await userOutput.users["123"]()).toBe("123");

    const nested = new Vector();
    nested.branch("users").branch(":id").open("profile", (ctx) => ctx.params.id);
    specimen.expect(await shape.proxy(nested).users.john.profile()).toBe("john");

    const accumulate = new Vector();
    accumulate.branch(":org").branch(":repo").open("readme", (ctx) => `${ctx.params.org}/${ctx.params.repo}`);
    specimen.expect(await shape.proxy(accumulate).vivalence.vector.readme()).toBe("vivalence/vector");
  });

  specimen.it("a proxy catches wildcards and remainders at any depth", async () => {
    const wildcard = new Vector();
    wildcard.open("*", () => "caught");
    specimen.expect(await shape.proxy(wildcard).anything()).toBe("caught");

    const remainder = new Vector();
    remainder.open("(.*)", (ctx) => ctx.params);
    specimen.expect(await shape.proxy(remainder).some.deep.path()).toEqual({ 0: "some", 1: "deep", 2: "path" });

    const single = new Vector();
    single.open("(.*)", (ctx) => ctx.params[0]);
    specimen.expect(await shape.proxy(single).hello()).toBe("hello");

    const afterBranch = new Vector();
    afterBranch.branch("api").open("(.*)", (ctx) => ctx.params);
    specimen.expect(await shape.proxy(afterBranch).api.foo.bar()).toEqual({ 0: "foo", 1: "bar" });
  });

  specimen.it("a proxy runs middleware with params and input together", async () => {
    const trace = [];
    const vector = new Vector();
    vector.use(async (_, next) => { trace.push("mw"); await next(); });
    vector.branch("items").open(":id", (ctx) => { trace.push("effect"); return ctx.params.id; });
    specimen.expect(await shape.proxy(vector).items.abc()).toBe("abc");
    specimen.expect(trace).toEqual(["mw", "effect"]);

    const coexist = new Vector();
    coexist.branch("users").open(":id", (ctx) => ({ id: ctx.params.id, expand: ctx.input.expand }));
    specimen.expect(await shape.proxy(coexist).users.john({ expand: true })).toEqual({ id: "john", expand: true });
  });
});
