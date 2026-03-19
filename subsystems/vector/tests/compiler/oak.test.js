import { sleep, specimen, Url, Connection } from "@vivalence/typology";
import { Application } from "@oak/oak";
import { Vector } from "@vivalence/vector";
import { oak } from "../../compiler/oak.js";

function buildVector() {
  const vector = new Vector();

  vector.open("/ping", () => "pong");
  vector.open("/zero", () => 42);
  vector.open("/echo", (input, ctx) => ({ body: input, method: ctx.request.method }));
  vector.open("/users/:id", (ctx) => ({ id: ctx.params.id }));

  vector
    .branch("/api")
    .use(async (ctx, next) => {
      ctx.state.apiBranch = true;
      await next();
    })
    .open("/items", () => [1, 2, 3])
    .open("/items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
      apiBranch: ctx.state.apiBranch,
    }));

  vector.use(async (ctx, next) => {
    ctx.state.root = true;
    await next();
  });

  vector.branch("/a/b/c").open("/leaf", () => ({ deep: true }));

  return vector;
}

async function startOak(port, vector) {
  const app = new Application();
  const controller = new AbortController();
  app.use(oak(vector));
  await new Promise((resolve) => {
    app.addEventListener("listen", resolve, { once: true });
    app.listen({ port, signal: controller.signal });
  });
  await sleep.ms(100);
  return controller;
}

specimen.describe("oak compiler", () => {
  specimen.describe("HTTP serve", () => {
    const PORT = 9877;
    let controller;
    const conn = new Connection(new Url(`http://localhost:${PORT}`));

    specimen.beforeAll(async () => {
      controller = await startOak(PORT, buildVector());
    });

    specimen.afterAll(() => controller.abort());

    specimen.it("arity 0 — returns value as JSON", async () => {
      specimen.expect(await conn.call("/ping")).toBe("pong");
    });

    specimen.it("arity 0 — number", async () => {
      specimen.expect(await conn.call("/zero")).toBe(42);
    });

    specimen.it("arity 2 — receives parsed body", async () => {
      const result = await conn.call("/echo", { hello: "world" });
      specimen.expect(result.body.hello).toBe("world");
    });

    specimen.it("404 on unmatched route", async () => {
      const response = await conn.fetch("/nonexistent");
      specimen.expect(response.status).toBe(404);
    });

    specimen.it("params from :id pattern", async () => {
      const result = await conn.call("/users/42");
      specimen.expect(result.id).toBe("42");
    });

    specimen.it("branch routes", async () => {
      specimen.expect(await conn.call("/api/items")).toEqual([1, 2, 3]);
    });

    specimen.it("branch middleware + params accumulate", async () => {
      const result = await conn.call("/api/items/7");
      specimen.expect(result.itemId).toBe("7");
      specimen.expect(result.apiBranch).toBe(true);
    });

    specimen.it("multi-segment branch path", async () => {
      const result = await conn.call("/a/b/c/leaf");
      specimen.expect(result.deep).toBe(true);
    });
  });

  specimen.describe("composition — slurp", () => {
    const PORT = 9878;
    let controller;

    const domain = new Vector();
    domain.open("/pick", () => "picked");
    domain.open("/review", () => "reviewed");

    const userspace = new Vector();
    userspace.use(async (ctx, next) => {
      ctx.state.userscoped = true;
      await next();
    });
    userspace.open("/status", (ctx) => ({ userscoped: ctx.state.userscoped }));
    userspace.branch("/entities/:entity").open("/:method", (ctx) => ({
      entity: ctx.params.entity,
      method: ctx.params.method,
      userscoped: ctx.state.userscoped,
    }));

    const daemon = new Vector();
    daemon.branch("/domain").slurp(domain);
    daemon.branch("/userspace").slurp(userspace);

    const conn = new Connection(new Url(`http://localhost:${PORT}`));

    specimen.beforeAll(async () => {
      controller = await startOak(PORT, daemon);
    });

    specimen.afterAll(() => controller.abort());

    specimen.it("merged routes", async () => {
      specimen.expect(await conn.call("/domain/pick")).toBe("picked");
      specimen.expect(await conn.call("/domain/review")).toBe("reviewed");
    });

    specimen.it("child middleware preserved through slurp", async () => {
      const status = await conn.call("/userspace/status");
      specimen.expect(status.userscoped).toBe(true);
    });

    specimen.it("nested params across slurp", async () => {
      const entity = await conn.call("/userspace/entities/literal/find");
      specimen.expect(entity.entity).toBe("literal");
      specimen.expect(entity.method).toBe("find");
      specimen.expect(entity.userscoped).toBe(true);
    });
  });
});
