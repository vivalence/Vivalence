import { specimen, Signal, Context, Url, Connection, sleep, fromm } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { http } from "../../compiler/http.js";
import { traverse } from "../../controller/traverse.js";
import { NotFound } from "../../prototypes/errors.js";

specimen.describe("http compiler", () => {
  specimen.describe("simple routes", () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");
    vector.open("zero", () => 42);
    vector.open("echo", (input, ctx) => ({ input }));

    const handler = http(vector);

    specimen.it("arity 0 — returns value as JSON", async () => {
      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(await res.json()).toBe("pong");
    });

    specimen.it("arity 0 — number", async () => {
      const res = await handler(new Request("http://localhost/zero"));
      specimen.expect(await res.json()).toBe(42);
    });

    specimen.it("arity 2 — receives parsed body", async () => {
      const res = await handler(new Request("http://localhost/echo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hello: "world" }),
      }));
      const body = await res.json();
      specimen.expect(body.input.hello).toBe("world");
    });

    specimen.it("404 on unmatched route", async () => {
      const res = await handler(new Request("http://localhost/nonexistent"));
      specimen.expect(res.status).toBe(404);
    });

    specimen.it("default content-type is application/json", async () => {
      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.headers.get("content-type")).toBe("application/json");
    });
  });

  specimen.describe("middleware + params + branches", () => {
    const vector = new Vector();

    vector.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.root = true;
      await next();
    });

    vector.open("users/:id", (ctx) => ({
      id: ctx.params.id,
      root: ctx.state.root,
    }));

    const api = vector.branch("api");
    api.use(async (ctx, next) => {
      ctx.state.api = true;
      await next();
    });
    api.open("items", () => [1, 2, 3]);
    api.open("items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
      api: ctx.state.api,
      root: ctx.state.root,
    }));

    const handler = http(vector);

    specimen.it("params from :id pattern", async () => {
      const res = await handler(new Request("http://localhost/users/42"));
      const body = await res.json();
      specimen.expect(body.id).toBe("42");
      specimen.expect(body.root).toBe(true);
    });

    specimen.it("branch routes", async () => {
      const res = await handler(new Request("http://localhost/api/items"));
      specimen.expect(await res.json()).toEqual([1, 2, 3]);
    });

    specimen.it("branch middleware + params accumulate", async () => {
      const res = await handler(new Request("http://localhost/api/items/7"));
      const body = await res.json();
      specimen.expect(body.itemId).toBe("7");
      specimen.expect(body.api).toBe(true);
      specimen.expect(body.root).toBe(true);
    });
  });

  specimen.describe("response types", () => {
    const vector = new Vector();

    vector.open("json", () => ({ data: true }));

    vector.open("binary", (ctx) => {
      ctx.response.type = "audio/mpeg";
      return new Uint8Array([0x49, 0x44, 0x33]);
    });

    const handler = http(vector);

    specimen.it("JSON default", async () => {
      const res = await handler(new Request("http://localhost/json"));
      specimen.expect(res.headers.get("content-type")).toBe("application/json");
      specimen.expect(await res.json()).toEqual({ data: true });
    });

    specimen.it("binary with custom type", async () => {
      const res = await handler(new Request("http://localhost/binary"));
      specimen.expect(res.headers.get("content-type")).toBe("audio/mpeg");
      const buf = new Uint8Array(await res.arrayBuffer());
      specimen.expect(buf[0]).toBe(0x49);
    });
  });

  specimen.describe("re-entrant vector call", () => {
    const vector = new Vector();

    function withCall(vec) {
      return async (ctx, next) => {
        ctx.call = async (path, body) => {
          const signal = new Signal(path);
          const [effect, carry, steps] = traverse(vec, signal);
          if (!effect) throw new NotFound(signal);
          const inner = new Context({
            body, url: `http://internal${path}`, method: "POST",
          });
          inner.params = fromm.match(steps).parameters;
          await carry(inner, async (c) => {
            if (effect.length === 0) c.output = await effect();
            else if (effect.length === 1) c.output = await effect(c);
            else if (effect.length === 2) c.output = await effect(c.input, c);
          });
          return inner.output;
        };
        await next();
      };
    }

    vector.use(withCall(vector));
    vector.use(async (ctx, next) => {
      ctx.auth = "token-123";
      await next();
    });

    vector.open("lookup/:id", (ctx) => ({
      id: ctx.params.id,
      auth: ctx.auth,
    }));

    vector.open("aggregate", async (input, ctx) => {
      const a = await ctx.call("/lookup/1");
      const b = await ctx.call("/lookup/2");
      return { results: [a, b], auth: ctx.auth };
    });

    const handler = http(vector);

    specimen.it("direct lookup works", async () => {
      const res = await handler(new Request("http://localhost/lookup/5"));
      const body = await res.json();
      specimen.expect(body.id).toBe("5");
      specimen.expect(body.auth).toBe("token-123");
    });

    specimen.it("aggregate re-enters vector for inner calls", async () => {
      const res = await handler(new Request("http://localhost/aggregate"));
      const body = await res.json();
      specimen.expect(body.results[0].id).toBe("1");
      specimen.expect(body.results[1].id).toBe("2");
      specimen.expect(body.results[0].auth).toBe("token-123");
      specimen.expect(body.results[1].auth).toBe("token-123");
      specimen.expect(body.auth).toBe("token-123");
    });
  });

  specimen.describe("wildcard and remainder patterns", () => {
    const vector = new Vector();

    vector.branch("proxy").branch("*").open("status", (ctx) => ({
      matched: true,
    }));

    vector.branch("files").branch(":name").open("download", (ctx) => ({
      name: ctx.params.name,
    }));

    const handler = http(vector);

    specimen.it("wildcard matches any single segment", async () => {
      const res = await handler(new Request("http://localhost/proxy/anything/status"));
      const body = await res.json();
      specimen.expect(body.matched).toBe(true);
    });

    specimen.it("param captures single segment", async () => {
      const res = await handler(new Request("http://localhost/files/readme.txt/download"));
      const body = await res.json();
      specimen.expect(body.name).toBe("readme.txt");
    });
  });

  specimen.describe("serve + connection integration", () => {
    const vector = new Vector();

    vector.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.served = true;
      await next();
    });

    vector.open("ping", () => ({ pong: true }));
    vector.open("echo", (input, ctx) => ({ input, served: ctx.state.served }));
    vector.open("users/:id", (ctx) => ({ id: ctx.params.id }));

    const handler = http(vector);
    const PORT = 9878;
    const abort = new AbortController();

    specimen.beforeAll(async () => {
      Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, handler);
      await sleep.ms(500);
    });

    specimen.afterAll(() => {
      abort.abort();
    });

    specimen.describe("Connection via HTTP (fetcher)", () => {
      const conn = new Connection(new Url(`http://localhost:${PORT}`));

      specimen.it("call returns body directly", async () => {
        specimen.expect(await conn.call("/ping")).toEqual({ pong: true });
      });

      specimen.it("call with body", async () => {
        const result = await conn.call("/echo", { hello: "world" });
        specimen.expect(result.input.hello).toBe("world");
        specimen.expect(result.served).toBe(true);
      });

      specimen.it("params", async () => {
        const result = await conn.call("/users/42");
        specimen.expect(result.id).toBe("42");
      });

      specimen.it("404 via fetch", async () => {
        const response = await conn.fetch("/nonexistent");
        specimen.expect(response.status).toBe(404);
      });
    });

    specimen.describe("Connection internal (handler as transport)", () => {
      function handlerTransport(handler) {
        return async (ctx) => {
          const nativeReq = new Request(ctx.request.url.absolute, {
            method: ctx.request.method,
            headers: {
              "content-type": "application/json",
              ...Object.fromEntries(ctx.request.headers),
            },
            body: ctx.request.method !== "GET" && ctx.request.body !== undefined
              ? JSON.stringify(ctx.request.body)
              : undefined,
          });
          const nativeRes = await handler(nativeReq);
          ctx.response.status = nativeRes.status;
          nativeRes.headers.forEach((v, k) => ctx.response.headers.set(k, v));
          if (nativeRes.body) {
            const contentType = nativeRes.headers.get("content-type") || "";
            ctx.response.body = contentType.includes("application/json")
              ? await nativeRes.json().catch(() => null)
              : await nativeRes.text();
          }
          if (!nativeRes.ok) ctx.response.setError();
        };
      }

      const conn = new Connection(new Url("http://internal"), handlerTransport(handler));

      specimen.it("call without HTTP", async () => {
        specimen.expect(await conn.call("/ping")).toEqual({ pong: true });
      });

      specimen.it("call with body without HTTP", async () => {
        const result = await conn.call("/echo", { hello: "internal" });
        specimen.expect(result.input.hello).toBe("internal");
        specimen.expect(result.served).toBe(true);
      });

      specimen.it("params without HTTP", async () => {
        const result = await conn.call("/users/99");
        specimen.expect(result.id).toBe("99");
      });

      specimen.it("404 without HTTP", async () => {
        const response = await conn.fetch("/nonexistent");
        specimen.expect(response.status).toBe(404);
      });
    });
  });
});
