import { sleep, specimen, Url, Connection, Response } from "@vivalence/typology";
import { Application } from "@oak/oak";
import { Vector } from "@vivalence/vector";
import { parser, mw } from "@vivalence/vector/aperture";
import { oak } from "../../compiler/oak.js";

const PORT = 9877;

function oakTransport(compiled) {
  return async (ctx) => {
    ctx.input = ctx.request.body;
    ctx.request.url = new URL(ctx.request.url.absolute);
    ctx.request.headers = new Headers();
    await compiled(ctx, () => {});
    ctx.response.body = ctx.output;
    ctx.response.status = ctx.output !== undefined ? 200 : 404;
  };
}

specimen.describe("oak compiler", () => {
  specimen.describe("compose — internal invocation", () => {
    const vector = new Vector();

    vector.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.touched = true;
      await next();
    });

    vector.open("ping", () => "pong");
    vector.open("zero", () => 42);
    vector.open("one", (ctx) => ({ got: ctx.input, touched: ctx.state.touched }));
    vector.open("two", (input, ctx) => ({ input, hasCtx: !!ctx }));
    vector.open("users/:id", (ctx) => ({ id: ctx.params.id }));

    const branch = vector.branch("api");
    branch.use(async (ctx, next) => {
      ctx.state.apiBranch = true;
      await next();
    });
    branch.open("items", () => [1, 2, 3]);
    branch.open("items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
      apiBranch: ctx.state.apiBranch,
    }));

    const compiled = oak(vector);
    const conn = new Connection(new Url("http://internal"), oakTransport(compiled));

    specimen.it("routes, arity dispatch, and middleware", async () => {
      specimen.expect(await conn.call("/ping")).toBe("pong");
      specimen.expect(await conn.call("/zero")).toBe(42);

      const one = await conn.call("/one", { x: 1 });
      specimen.expect(one.got).toEqual({ x: 1 });
      specimen.expect(one.touched).toBe(true);

      const two = await conn.call("/two", { y: 2 });
      specimen.expect(two.input).toEqual({ y: 2 });
      specimen.expect(two.hasCtx).toBe(true);
    });

    specimen.it("params and branch middleware", async () => {
      specimen.expect((await conn.call("/users/42")).id).toBe("42");
      specimen.expect(await conn.call("/api/items")).toEqual([1, 2, 3]);

      const item = await conn.call("/api/items/7");
      specimen.expect(item.itemId).toBe("7");
      specimen.expect(item.apiBranch).toBe(true);
    });

    specimen.it("unmatched route leaves output undefined", async () => {
      specimen.expect(await conn.call("/nope")).toBe(undefined);
    });
  });

  specimen.describe("ctx.input / ctx.output contract", () => {
    const vector = new Vector();
    vector.use(async (ctx, next) => {
      ctx.input.injected = true;
      await next();
      ctx.output.wrapped = true;
    });
    vector.open("transform", (input, ctx) => ({ doubled: input.n * 2, saw: input.injected }));
    vector.open("echo", (input, ctx) => ({ input }));

    const compiled = oak(vector);
    const conn = new Connection(new Url("http://internal"), oakTransport(compiled));

    specimen.it("input preserved, output is return value, middleware can mutate both", async () => {
      const tx = {
        request: { body: { n: 21 }, url: new Url("http://internal/transform") },
        response: new Response(),
        state: {},
      };
      await conn.transport(tx);
      specimen.expect(tx.input).toEqual({ n: 21, injected: true });
      specimen.expect(tx.output.doubled).toBe(42);
      specimen.expect(tx.output.saw).toBe(true);
      specimen.expect(tx.output.wrapped).toBe(true);

      const echo = {
        request: { body: { x: 1 }, url: new Url("http://internal/echo") },
        response: new Response(),
        state: {},
      };
      await conn.transport(echo);
      specimen.expect(echo.output.input).toEqual({ x: 1, injected: true });
      specimen.expect(echo.output.wrapped).toBe(true);
    });
  });

  specimen.describe("serve — HTTP invocation via Oak", () => {
    const vector = new Vector();

    vector.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.touched = true;
      await next();
    });

    vector.open("ping", () => ({ pong: true }));
    vector.open("echo", (input, ctx) => ({ input, touched: ctx.state.touched }));
    vector.open("users/:id", (ctx) => ({ id: ctx.params.id }));

    const branch = vector.branch("api");
    branch.use(async (ctx, next) => {
      ctx.state.apiBranch = true;
      await next();
    });
    branch.open("items", () => [1, 2, 3]);
    branch.open("items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
      apiBranch: ctx.state.apiBranch,
    }));

    const app = new Application();
    const controller = new AbortController();

    app.use(mw.notFound).use(async (ctx, next) => {
      ctx.input = await parser(ctx);
      await next();
      if (ctx.output) ctx.response.body = ctx.output;
    });
    app.use(oak(vector));

    const conn = new Connection(new Url(`http://localhost:${PORT}`));

    specimen.beforeAll(async () => {
      app.listen({ port: PORT, signal: controller.signal });
      await sleep.ms(500);
    });

    specimen.afterAll(() => {
      controller.abort();
    });

    specimen.it("routes, params, and middleware over HTTP", async () => {
      const ping = await conn.call("/ping");
      specimen.expect(ping.pong).toBe(true);

      const echo = await conn.call("/echo", { hello: "world" });
      specimen.expect(echo.input.hello).toBe("world");
      specimen.expect(echo.touched).toBe(true);

      const user = await conn.call("/users/99");
      specimen.expect(user.id).toBe("99");

      const items = await conn.call("/api/items");
      specimen.expect(items).toEqual([1, 2, 3]);

      const item = await conn.call("/api/items/7");
      specimen.expect(item.itemId).toBe("7");
      specimen.expect(item.apiBranch).toBe(true);
    });

    specimen.it("404 on unknown route", async () => {
      const response = await conn.fetch("/nonexistent");
      specimen.expect(response.status).toBe(404);
    });
  });

  specimen.describe("composition — multiple vectors", () => {
    const domain = new Vector();
    domain.open("pick", () => "picked");
    domain.open("review", () => "reviewed");

    const userspace = new Vector();
    userspace.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.userscoped = true;
      await next();
    });
    userspace.open("status", (ctx) => ({ userscoped: ctx.state.userscoped }));
    userspace.branch("entities/:entity").open(":method", (ctx) => ({
      entity: ctx.params.entity,
      method: ctx.params.method,
      userscoped: ctx.state.userscoped,
    }));

    const daemon = new Vector();
    daemon.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.daemon = true;
      await next();
    });
    daemon.branch("domain").set(domain);
    daemon.branch("userspace").set(userspace);

    const compiled = oak(daemon);
    const conn = new Connection(new Url("http://internal"), oakTransport(compiled));

    specimen.it("merged routes, child middleware, and params", async () => {
      specimen.expect(await conn.call("/domain/pick")).toBe("picked");
      specimen.expect(await conn.call("/domain/review")).toBe("reviewed");

      const status = await conn.call("/userspace/status");
      specimen.expect(status.userscoped).toBe(true);

      const entity = await conn.call("/userspace/entities/literal/find");
      specimen.expect(entity.entity).toBe("literal");
      specimen.expect(entity.method).toBe("find");
      specimen.expect(entity.userscoped).toBe(true);
    });
  });
});
