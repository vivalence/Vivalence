import { expect, assertEquals, assertExists, assert } from "@vivalence/typology/specimen";
import { describe, it, beforeAll, afterAll } from "@vivalence/typology/specimen";
import { sleep } from "@vivalence/typology";

import { Application, Router } from "@oak/oak";

import { Aperture, Path, context as mkctx, parser, mw } from "@vivalence/vector/aperture";

const PORT = 9876;
const BASE = `http://localhost:${PORT}`;

const invoke = async (composed, path, body = {}, params = {}) => {
  const ctx = mkctx(path, body, params);
  await composed(ctx);
  return ctx;
};

const http = async (path, body, method = "POST") => {
  // console.log(`${BASE}${path}`, {method, headers: { "Content-Type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(body),});

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });

  return { status: res.status, body: await res.json().catch(() => null) };
};

describe("Aperture Baseline", () => {
  describe("compose() — internal invocation", () => {
    it("open() registers an effect reachable via compose", async () => {
      const ap = new Aperture();
      ap.open("/ping", () => "pong");
      const ctx = await invoke(ap.compose(), "/ping");
      expect(ctx.output).toBe("pong");
      // assertEquals(ctx.output, "pong");
    });
    it("handler arity 0 — no args", async () => {
      const ap = new Aperture();
      ap.open("/zero", () => 42);
      const ctx = await invoke(ap.compose(), "/zero");
      assertEquals(ctx.output, 42);
    });
    it("handler arity 1 — receives ctx", async () => {
      const ap = new Aperture();
      ap.open("/one", (ctx) => ({ got: ctx.input }));
      const ctx = await invoke(ap.compose(), "/one", { x: 1 });
      assertEquals(ctx.output.got, { x: 1 });
    });
    it("handler arity 2 — receives (body, ctx)", async () => {
      const ap = new Aperture();
      ap.open("/two", (body, ctx) => ({ body, hasCtx: !!ctx }));
      const ctx = await invoke(ap.compose(), "/two", { y: 2 });
      assertEquals(ctx.output.body, { y: 2 });
      assertEquals(ctx.output.hasCtx, true);
    });
    it("use() applies middleware in order", async () => {
      const order = [];
      const ap = new Aperture();
      ap.use(async (ctx, next) => {
        order.push("a:before");
        await next();
        order.push("a:after");
      });
      ap.use(async (ctx, next) => {
        order.push("b:before");
        await next();
        order.push("b:after");
      });
      ap.open("/mw", () => {
        order.push("effect");
        return "ok";
      });
      const ctx = await invoke(ap.compose(), "/mw");
      assertEquals(ctx.output, "ok");
      assertEquals(order, ["a:before", "b:before", "effect", "b:after", "a:after"]);
    });
    it("middleware can decorate context", async () => {
      const ap = new Aperture();
      ap.use(async (ctx, next) => {
        ctx.injected = "hello";
        await next();
      });
      ap.open("/decorated", (body, ctx) => ctx.injected);
      const ctx = await invoke(ap.compose(), "/decorated");
      assertEquals(ctx.output, "hello");
    });
    it("branch() creates nested namespace", async () => {
      const ap = new Aperture();
      ap.branch("/api").open("/items", () => [1, 2, 3]);
      const ctx = await invoke(ap.compose(), "/api/items");
      assertEquals(ctx.output, [1, 2, 3]);
    });
    it("branch middleware scoped to branch", async () => {
      const order = [];
      const ap = new Aperture();
      ap.use(async (ctx, next) => {
        order.push("root");
        await next();
      });
      const branch = ap.branch("/scoped");
      branch.use(async (ctx, next) => {
        order.push("branch");
        await next();
      });
      branch.open("/hit", () => {
        order.push("effect");
        return "ok";
      });
      const ctx = await invoke(ap.compose(), "/scoped/hit");
      assertEquals(ctx.output, "ok");
      assert(order.includes("root"), "root middleware ran");
      assert(order.includes("branch"), "branch middleware ran");
      assert(order.includes("effect"), "effect ran");
    });
    it("params extracted from :param patterns", async () => {
      const ap = new Aperture();
      ap.open("/users/:id", (ctx) => ({ id: ctx.params.id }));
      const ctx = await invoke(ap.compose(), "/users/42");
      assertEquals(ctx.output.id, "42");
    });
    it("nested params across branch + open", async () => {
      const ap = new Aperture();
      ap.branch("/entities/:entity").open("/:method", (ctx) => ({
        entity: ctx.params.entity,
        method: ctx.params.method,
      }));
      const ctx = await invoke(ap.compose(), "/entities/user/find");
      assertEquals(ctx.output.entity, "user");
      assertEquals(ctx.output.method, "find");
    });
    it("slurp() absorbs another aperture", async () => {
      const child = new Aperture(new Path("/child"));
      child.open("/x", () => "from-child");
      const parent = new Aperture();
      parent.slurp(child);
      const ctx = await invoke(parent.compose(), "/child/x");
      assertEquals(ctx.output, "from-child");
    });
    it("slurp preserves child middleware", async () => {
      const order = [];
      const child = new Aperture(new Path("/inner"));
      child.use(async (ctx, next) => {
        order.push("child-mw");
        await next();
      });
      child.open("/go", () => {
        order.push("child-effect");
        return "done";
      });
      const parent = new Aperture();
      parent.use(async (ctx, next) => {
        order.push("parent-mw");
        await next();
      });
      parent.slurp(child);
      const ctx = await invoke(parent.compose(), "/inner/go");
      assertEquals(ctx.output, "done");
      assert(order.includes("parent-mw"));
      assert(order.includes("child-mw"));
      assert(order.includes("child-effect"));
    });
    it("404 — unmatched route", async () => {
      const ap = new Aperture();
      ap.open("/exists", () => "yes");
      const ctx = await invoke(ap.compose(), "/nope");
      assert(
        ctx.response.status === 404 || ctx.output === undefined,
        "unmatched route yields 404 or undefined output",
      );
    });
    it("compose(true) forces recompilation", async () => {
      const ap = new Aperture();
      ap.open("/v1", () => "first");
      const c1 = ap.compose();
      ap.open("/v2", () => "second");
      const c2 = ap.compose(true);
      const ctx = await invoke(c2, "/v2");
      assertEquals(ctx.output, "second");
    });
    it("multiple effects on same aperture", async () => {
      const ap = new Aperture();
      ap.open("/a", () => "alpha");
      ap.open("/b", () => "beta");
      const composed = ap.compose();
      assertEquals((await invoke(composed, "/a")).output, "alpha");
      assertEquals((await invoke(composed, "/b")).output, "beta");
    });
  });

  describe("serve() — HTTP invocation via Oak", () => {
    let app, controller;

    beforeAll(async () => {
      const ap = new Aperture();

      ap.use(async (ctx, next) => {
        ctx.state.touched = true;
        await next();
      });

      ap.open("/ping", () => ({ pong: true }));

      ap.open("/echo", (body, ctx) => ({ body, touched: ctx.state.touched }));

      ap.open("/users/:id", (ctx) => ({ id: ctx.params.id }));

      const branch = ap.branch("/api");
      branch.use(async (ctx, next) => {
        ctx.state.apiBranch = true;
        await next();
      });
      branch.open("/items", () => [1, 2, 3]);
      branch.open("/items/:itemId", (ctx) => ({
        itemId: ctx.params.itemId,
        apiBranch: ctx.state.apiBranch,
      }));

      app = new Application();
      const router = new Router();

      app.use(mw.notFound).use(async (ctx, next) => {
        ctx.input = await parser(ctx);
        await next();
        if (ctx.output) ctx.response.body = ctx.output;
        // else ctx.response.body.cancel();
      });

      ap.serve(router);
      app.use(router.routes());
      app.use(router.allowedMethods());

      controller = new AbortController();
      app.listen({ port: PORT, signal: controller.signal });
      await sleep.ms(500);
    });

    afterAll(() => {
      controller.abort();
    });

    it("GET /ping", async () => {
      const res = await http("/ping", null, "GET");
      assertEquals(res.body?.pong, true);
    });

    it("POST /echo with body", async () => {
      const res = await http("/echo", { hello: "world" });
      assertEquals(res.body?.body?.hello, "world");
      assertEquals(res.body?.touched, true);
    });

    it("params from /users/:id", async () => {
      const res = await http("/users/99", null, "GET");
      assertEquals(res.body?.id, "99");
    });

    it("branch /api/items", async () => {
      const res = await http("/api/items", null, "GET");
      assertEquals(res.body, [1, 2, 3]);
    });

    it("branch params /api/items/:itemId", async () => {
      const res = await http("/api/items/7", null, "GET");
      assertEquals(res.body?.itemId, "7");
      assertEquals(res.body?.apiBranch, true);
    });

    it("404 on unknown route", async () => {
      const res = await fetch(`${BASE}/nonexistent`);
      assert(res.status === 404 || res.status === 405);
      res.body.cancel();
    });
  });

  describe("dual-mode parity", () => {
    let ap, composed;

    beforeAll(() => {
      ap = new Aperture();

      ap.use(async (ctx, next) => {
        ctx.state = ctx.state || {};
        ctx.state.mw = true;
        await next();
      });

      ap.open("/echo", (body, ctx) => ({
        body,
        mw: ctx.state?.mw,
      }));

      ap.open("/entities/:entity/:method", (ctx) => ({
        entity: ctx.params.entity,
        method: ctx.params.method,
      }));

      composed = ap.compose(true);
    });

    it("internal: /echo matches HTTP behavior", async () => {
      const ctx = await invoke(composed, "/echo", { x: 1 });
      assertEquals(ctx.output.body, { x: 1 });
      assertEquals(ctx.output.mw, true);
    });

    it("internal: params extracted same as HTTP", async () => {
      const ctx = await invoke(composed, "/entities/literal/find");
      assertEquals(ctx.output.entity, "literal");
      assertEquals(ctx.output.method, "find");
    });
  });

  describe("ctx.input / ctx.output contract", () => {
    it("input is body, output is handler return", async () => {
      const ap = new Aperture();
      ap.open("/transform", (body, ctx) => {
        return { doubled: body.n * 2 };
      });

      const ctx = await invoke(ap.compose(), "/transform", { n: 21 });
      assertEquals(ctx.input, { n: 21 });
      assertEquals(ctx.output, { doubled: 42 });
    });

    it("middleware can read input and mutate output", async () => {
      const ap = new Aperture();
      ap.use(async (ctx, next) => {
        ctx.input.injected = true;
        await next();
        ctx.output.wrapped = true;
      });
      ap.open("/wrap", (body, ctx) => ({ saw: body.injected }));

      const ctx = await invoke(ap.compose(), "/wrap", {});
      assertEquals(ctx.output.saw, true);
      assertEquals(ctx.output.wrapped, true);
    });
  });

  describe("json inspection", () => {
    it(".json reflects structure", () => {
      const ap = new Aperture();
      ap.open("/a", () => {});
      ap.branch("/b").open("/c", () => {});

      const json = ap.json;
      assertExists(json);
    });
  });
});
