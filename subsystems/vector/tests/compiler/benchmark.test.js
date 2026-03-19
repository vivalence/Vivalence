import { sleep, specimen, Url, Connection, shard } from "@vivalence/typology";
import { Application } from "@oak/oak";
import { Vector } from "@vivalence/vector";
import { http } from "../../compiler/http.js";
import { oak } from "../../compiler/oak.js";

function buildVector() {
  const vector = new Vector();

  vector.use(async (ctx, next) => {
    ctx.state.ts = performance.now();
    await next();
  });

  vector.open("/ping", () => "pong");
  vector.open("/echo", (input, _ctx) => ({ received: input }));
  vector.open("/users/:id", (ctx) => ({ id: ctx.params.id }));

  vector
    .branch("/api")
    .use(async (ctx, next) => {
      ctx.state.api = true;
      await next();
    })
    .open("/items", () => [1, 2, 3])
    .open("/items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
    }));

  vector.branch("/a/b/c").open("/deep", () => ({ deep: true }));

  return vector;
}

function percentile(sorted, p) {
  const i = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, i)];
}

function stats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  return {
    p50: percentile(sorted, 50).toFixed(3),
    p95: percentile(sorted, 95).toFixed(3),
    p99: percentile(sorted, 99).toFixed(3),
    mean: (sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(3),
    rps: Math.round(sorted.length / (sorted.reduce((a, b) => a + b, 0) / 1000)),
  };
}

const WARMUP = 200;
const ITERATIONS = 2000;
const ROUTES = [
  { path: "/ping", body: null, label: "simple (0-arity)" },
  { path: "/echo", body: { data: "hello" }, label: "echo (2-arity + body)" },
  { path: "/users/42", body: null, label: "param (:id)" },
  { path: "/api/items/7", body: null, label: "branch + param" },
  { path: "/a/b/c/deep", body: null, label: "4-segment branch" },
];

async function benchmark(conn) {
  const results = {};
  for (const route of ROUTES) {
    for (let i = 0; i < WARMUP; i++) await conn.call(route.path, route.body || {});
    const times = [];
    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      await conn.call(route.path, route.body || {});
      times.push(performance.now() - start);
    }
    results[route.label] = stats(times);
  }
  return results;
}

function print(httpResults, oakResults, title) {
  console.log(`\n=== ${title} ===`);
  console.log(`${ITERATIONS} iterations, ${WARMUP} warmup per route\n`);

  const rows = [];
  for (const route of ROUTES) {
    const h = httpResults[route.label];
    const o = oakResults[route.label];
    const ratio = (Number(o.mean) / Number(h.mean)).toFixed(2);
    rows.push({ route: route.label, h, o, ratio });
  }

  console.log("route                    │ http p50  │ oak p50   │ http mean │ oak mean  │ ratio");
  console.log("─────────────────────────┼───────────┼───────────┼───────────┼───────────┼──────");
  for (const r of rows) {
    const name = r.route.padEnd(24);
    console.log(`${name} │ ${r.h.p50.padStart(7)}ms │ ${r.o.p50.padStart(7)}ms │ ${r.h.mean.padStart(7)}ms │ ${r.o.mean.padStart(7)}ms │ ${r.ratio}x`);
  }

  const hTotal = Object.values(httpResults).reduce((s, r) => s + Number(r.mean), 0);
  const oTotal = Object.values(oakResults).reduce((s, r) => s + Number(r.mean), 0);
  console.log(`\nAggregate mean: http=${hTotal.toFixed(3)}ms  oak=${oTotal.toFixed(3)}ms  ratio=${(oTotal / hTotal).toFixed(2)}x`);

  const hRps = Object.values(httpResults).reduce((s, r) => s + r.rps, 0) / ROUTES.length;
  const oRps = Object.values(oakResults).reduce((s, r) => s + r.rps, 0) / ROUTES.length;
  console.log(`Avg req/s: http=${Math.round(hRps)}  oak=${Math.round(oRps)}`);
}

specimen.describe("compiler benchmark: oak vs http", () => {
  specimen.describe("inline transport (compilation overhead only)", () => {
    specimen.it("http compiler via inline transport vs oak over loopback", async () => {
      const vector = buildVector();

      const httpConn = new Connection(
        new Url("http://bench"),
        shard.transport.inline(http(vector)),
      );

      const OAK_PORT = 9896;
      const oakApp = new Application();
      const oakController = new AbortController();
      oakApp.use(oak(vector));
      await new Promise((resolve) => {
        oakApp.addEventListener("listen", resolve, { once: true });
        oakApp.listen({ port: OAK_PORT, signal: oakController.signal });
      });
      await sleep.ms(100);
      const oakConn = new Connection(new Url(`http://localhost:${OAK_PORT}`));

      const httpResults = await benchmark(httpConn);
      const oakResults = await benchmark(oakConn);

      oakController.abort();

      print(httpResults, oakResults, "INLINE HTTP vs OAK LOOPBACK (unfair — isolates framework overhead)");
    });
  });

  specimen.describe("HTTP transport (apples to apples)", () => {
    const HTTP_PORT = 9890;
    const OAK_PORT = 9891;
    let httpServer;
    let oakController;

    specimen.beforeAll(async () => {
      const vector = buildVector();

      httpServer = Deno.serve({ port: HTTP_PORT, onListen() {} }, http(vector));

      const oakApp = new Application();
      oakController = new AbortController();
      oakApp.use(oak(vector));
      await new Promise((resolve) => {
        oakApp.addEventListener("listen", resolve, { once: true });
        oakApp.listen({ port: OAK_PORT, signal: oakController.signal });
      });
      await sleep.ms(100);
    });

    specimen.afterAll(async () => {
      await httpServer.shutdown();
      oakController.abort();
    });

    specimen.it("Deno.serve vs Oak over real HTTP (steady state)", async () => {
      const httpConn = new Connection(new Url(`http://localhost:${HTTP_PORT}`));
      const oakConn = new Connection(new Url(`http://localhost:${OAK_PORT}`));

      const httpResults = await benchmark(httpConn);
      const oakResults = await benchmark(oakConn);

      print(httpResults, oakResults, "DENO.SERVE vs OAK (both over HTTP, steady state)");
    });
  });
});
