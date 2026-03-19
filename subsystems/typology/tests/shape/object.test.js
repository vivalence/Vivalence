import { specimen, middleware } from "@vivalence/typology";
import { Vector, shape } from "@vivalence/typology";

specimen.describe("object shape", () => {
  specimen.describe("flat effects", () => {
    specimen.it("compiles to callable property", async () => {
      const vector = new Vector();
      vector.open("greet", () => "hello");

      const output = shape.object(vector);
      specimen.expect(await output.greet()).toBe("hello");
    });

    specimen.it("multiple effects at root", async () => {
      const vector = new Vector();
      vector.open("add", (ctx) => ctx.input.a + ctx.input.b);
      vector.open("mul", (ctx) => ctx.input.a * ctx.input.b);

      const output = shape.object(vector);
      specimen.expect(await output.add({ a: 2, b: 3 })).toBe(5);
      specimen.expect(await output.mul({ a: 2, b: 3 })).toBe(6);
    });
  });

  specimen.describe("branching", () => {
    specimen.it("branch + effect compiles to nested property", async () => {
      const vector = new Vector();
      vector.branch("lorem").open("ipsum", () => "deep");

      const output = shape.object(vector);
      specimen.expect(await output.lorem.ipsum()).toBe("deep");
    });

    specimen.it("deep nesting", async () => {
      const vector = new Vector();
      vector
        .branch("a")
        .branch("b")
        .open("c", async () => 42);

      const output = shape.object(vector);
      specimen.expect(await output.a.b.c()).toBe(42);
    });

    specimen.it("sibling branches are independent", async () => {
      const vector = new Vector();
      vector.branch("left").open("go", () => "L");
      vector.branch("right").open("go", () => "R");

      const output = shape.object(vector);
      specimen.expect(await output.left.go()).toBe("L");
      specimen.expect(await output.right.go()).toBe("R");
    });
  });

  specimen.describe("middleware", () => {
    specimen.it("wraps effect", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => {
        trace.push("before");
        await next();
        trace.push("after");
      });
      vector.open("action", () => trace.push("effect"));

      const output = shape.object(vector);
      await output.action();
      specimen.expect(trace).toEqual(["before", "effect", "after"]);
    });

    specimen.it("branch-level middleware accumulates", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => {
        trace.push("root");
        await next();
      });
      vector
        .branch("api")
        .use(async (_, next) => {
          trace.push("branch");
          await next();
        })
        .open("call", () => trace.push("leaf"));

      const output = shape.object(vector);
      await output.api.call();
      specimen.expect(trace).toEqual(["root", "branch", "leaf"]);
    });

    specimen.it("context flows through middleware to effect", async () => {
      const vector = new Vector();

      vector.use(async (ctx, next) => {
        ctx.enriched = true;
        await next();
      });
      vector.open("check", (ctx) => ({ enriched: ctx.enriched }));

      const output = shape.object(vector);
      const result = await output.check();
      specimen.expect(result).toEqual({ enriched: true });
    });

    specimen.it("custom carry strategy", async () => {
      const vector = new Vector();
      vector.open("greet", () => "hello");

      const passthrough =
        (apply, effect) =>
        async (ctx = {}) => {
          let result;
          await apply(ctx, async (c) => {
            result = await effect(c);
          });
          return result;
        };

      const output = shape.object(vector, passthrough);
      specimen.expect(await output.greet()).toBe("hello");
    });

    specimen.it("carry strategy composes with branch middleware", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (ctx, next) => {
        trace.push("root");
        ctx.daemon = { name: "d" };
        await next();
      });
      vector
        .branch("api")
        .use(async (_, next) => {
          trace.push("branch");
          await next();
        })
        .open("info", (ctx) => ctx.daemon.name);

      const output = shape.object(vector);
      const result = await output.api.info();
      specimen.expect(result).toBe("d");
      specimen.expect(trace).toEqual(["root", "branch"]);
    });
  });
});

specimen.describe("proxy shape", () => {
  specimen.describe("literals", () => {
    specimen.it("compiles literal effects", async () => {
      const vector = new Vector();
      vector.open("greet", () => "hello");

      const output = shape.proxy(vector);
      specimen.expect(await output.greet()).toBe("hello");
    });

    specimen.it("compiles nested literals", async () => {
      const vector = new Vector();
      vector.branch("api").open("status", () => "ok");

      const output = shape.proxy(vector);
      specimen.expect(await output.api.status()).toBe("ok");
    });
  });

  specimen.describe("parameters", () => {
    specimen.it("captures parameter from property access", async () => {
      const vector = new Vector();
      vector.branch("users").open(":id", (ctx) => ctx.params.id);

      const output = shape.proxy(vector);
      specimen.expect(await output.users.john()).toBe("john");
      specimen.expect(await output.users["123"]()).toBe("123");
    });

    specimen.it("parameter trajectory with nested effect", async () => {
      const vector = new Vector();
      vector
        .branch("users")
        .branch(":id")
        .open("profile", (ctx) => ctx.params.id);

      const output = shape.proxy(vector);
      specimen.expect(await output.users.john.profile()).toBe("john");
    });

    specimen.it("literal takes priority over parameter", async () => {
      const vector = new Vector();
      const branch = vector.branch("users");
      branch.open("me", () => "self");
      branch.open(":id", (ctx) => ctx.params.id);

      const output = shape.proxy(vector);
      specimen.expect(await output.users.me()).toBe("self");
      specimen.expect(await output.users.john()).toBe("john");
    });

    specimen.it("params accumulate through nesting", async () => {
      const vector = new Vector();
      vector
        .branch(":org")
        .branch(":repo")
        .open("readme", (ctx) => `${ctx.params.org}/${ctx.params.repo}`);

      const output = shape.proxy(vector);
      specimen.expect(await output.vivalence.vector.readme()).toBe("vivalence/vector");
    });
  });

  specimen.describe("wildcards", () => {
    specimen.it("matches any property", async () => {
      const vector = new Vector();
      vector.open("*", () => "caught");

      const output = shape.proxy(vector);
      specimen.expect(await output.anything()).toBe("caught");
    });
  });

  specimen.describe("remainder", () => {
    specimen.it("catches arbitrary depth", async () => {
      const vector = new Vector();
      vector.open("(.*)", (ctx) => ctx.params);

      const output = shape.proxy(vector);
      specimen.expect(await output.some.deep.path()).toEqual({ 0: "some", 1: "deep", 2: "path" });
    });

    specimen.it("callable at any depth", async () => {
      const vector = new Vector();
      vector.open("(.*)", (ctx) => ctx.params[0]);

      const output = shape.proxy(vector);
      specimen.expect(await output.hello()).toBe("hello");
    });

    specimen.it("remainder after literal branch", async () => {
      const vector = new Vector();
      vector.branch("api").open("(.*)", (ctx) => ctx.params);

      const output = shape.proxy(vector);
      specimen.expect(await output.api.foo.bar()).toEqual({ 0: "foo", 1: "bar" });
    });
  });

  specimen.describe("middleware", () => {
    specimen.it("runs middleware with parameter effects", async () => {
      const trace = [];
      const vector = new Vector();

      vector.use(async (_, next) => {
        trace.push("mw");
        await next();
      });
      vector.branch("items").open(":id", (ctx) => {
        trace.push("effect");
        return ctx.params.id;
      });

      const output = shape.proxy(vector);
      const result = await output.items.abc();
      specimen.expect(result).toBe("abc");
      specimen.expect(trace).toEqual(["mw", "effect"]);
    });

    specimen.it("input and params coexist", async () => {
      const vector = new Vector();
      vector.branch("users").open(":id", (ctx) => ({
        id: ctx.params.id,
        expand: ctx.input.expand,
      }));

      const output = shape.proxy(vector);
      const result = await output.users.john({ expand: true });
      specimen.expect(result).toEqual({ id: "john", expand: true });
    });
  });
});
