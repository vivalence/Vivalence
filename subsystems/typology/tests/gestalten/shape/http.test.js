import { specimen, Signal, Context, Url, Connection, sleep, fromm, shard, NotFound, shape, steer, Vector, Aperture } from "@vivalence/typology";

specimen.describe("http shape", () => {
  specimen.it("a handler routes by arity, defaults to JSON, and 404s the rest", async () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");
    vector.open("zero", () => 42);
    vector.open("echo", (input, ctx) => ({ input }));
    const handler = shape.http(vector);

    const pong = await handler(new Request("http://localhost/ping"));
    specimen.expect(pong.status).toBe(200);
    specimen.expect(pong.headers.get("content-type")).toBe("application/json");
    specimen.expect(await pong.json()).toBe("pong");

    const zero = await handler(new Request("http://localhost/zero"));
    specimen.expect(await zero.json()).toBe(42);

    const echoed = await handler(new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hello: "world" }),
    }));
    specimen.expect((await echoed.json()).input.hello).toBe("world");

    const missing = await handler(new Request("http://localhost/nonexistent"));
    specimen.expect(missing.status).toBe(404);
  });

  specimen.it("middleware and params accumulate down branches", async () => {
    const vector = new Vector();
    vector.use(async (ctx, next) => { ctx.state = ctx.state || {}; ctx.state.root = true; await next(); });
    vector.open("users/:id", (ctx) => ({ id: ctx.params.id, root: ctx.state.root }));
    const api = vector.branch("api");
    api.use(async (ctx, next) => { ctx.state.api = true; await next(); });
    api.open("items", () => [1, 2, 3]);
    api.open("items/:itemId", (ctx) => ({ itemId: ctx.params.itemId, api: ctx.state.api, root: ctx.state.root }));
    const handler = shape.http(vector);

    const user = await (await handler(new Request("http://localhost/users/42"))).json();
    specimen.expect(user.id).toBe("42");
    specimen.expect(user.root).toBe(true);

    const items = await (await handler(new Request("http://localhost/api/items"))).json();
    specimen.expect(items).toEqual([1, 2, 3]);

    const item = await (await handler(new Request("http://localhost/api/items/7"))).json();
    specimen.expect(item.itemId).toBe("7");
    specimen.expect(item.api).toBe(true);
    specimen.expect(item.root).toBe(true);
  });

  specimen.it("a handler shapes JSON, binary, and native responses", async () => {
    const vector = new Vector();
    vector.open("json", () => ({ data: true }));
    vector.open("binary", (ctx) => { ctx.response.type = "audio/mpeg"; return new Uint8Array([0x49, 0x44, 0x33]); });
    vector.open("native", (ctx) => new Response("direct", { status: 201, headers: { "x-custom": "yes" } }));
    const handler = shape.http(vector);

    const json = await handler(new Request("http://localhost/json"));
    specimen.expect(json.headers.get("content-type")).toBe("application/json");
    specimen.expect(await json.json()).toEqual({ data: true });

    const binary = await handler(new Request("http://localhost/binary"));
    specimen.expect(binary.headers.get("content-type")).toBe("audio/mpeg");
    specimen.expect(new Uint8Array(await binary.arrayBuffer())[0]).toBe(0x49);

    const native = await handler(new Request("http://localhost/native"));
    specimen.expect(native.status).toBe(201);
    specimen.expect(native.headers.get("x-custom")).toBe("yes");
    specimen.expect(await native.text()).toBe("direct");
  });

  specimen.it("a vector re-enters itself for inner calls carrying context", async () => {
    const vector = new Vector();
    function withCall(target) {
      return async (ctx, next) => {
        ctx.call = async (path, body) => {
          const signal = new Signal(path);
          const [effect, carry, steps] = steer.dispatch.traverse(target, signal);
          if (!effect) throw new NotFound(signal);
          const inner = new Context({
            request: { body, url: `http://internal${path}`, method: "POST" },
            params: fromm.match(steps).parameters,
          });
          await carry(inner, async (innerContext) => {
            const result = await steer.strategy.fire(effect, innerContext);
            if (result !== undefined) innerContext.output = result;
          });
          return inner.output;
        };
        await next();
      };
    }
    vector.use(withCall(vector));
    vector.use(async (ctx, next) => { ctx.auth = "token-123"; await next(); });
    vector.open("lookup/:id", (ctx) => ({ id: ctx.params.id, auth: ctx.auth }));
    vector.open("aggregate", async (input, ctx) => {
      const first = await ctx.call("/lookup/1");
      const second = await ctx.call("/lookup/2");
      return { results: [first, second], auth: ctx.auth };
    });
    const handler = shape.http(vector);

    const direct = await (await handler(new Request("http://localhost/lookup/5"))).json();
    specimen.expect(direct.id).toBe("5");
    specimen.expect(direct.auth).toBe("token-123");

    const aggregated = await (await handler(new Request("http://localhost/aggregate"))).json();
    specimen.expect(aggregated.results[0].id).toBe("1");
    specimen.expect(aggregated.results[1].id).toBe("2");
    specimen.expect(aggregated.results[0].auth).toBe("token-123");
    specimen.expect(aggregated.results[1].auth).toBe("token-123");
    specimen.expect(aggregated.auth).toBe("token-123");
  });

  specimen.it("wildcards and params each match a single segment", async () => {
    const vector = new Vector();
    vector.branch("proxy").branch("*").open("status", (ctx) => ({ matched: true }));
    vector.branch("files").branch(":name").open("download", (ctx) => ({ name: ctx.params.name }));
    const handler = shape.http(vector);

    const wildcard = await (await handler(new Request("http://localhost/proxy/anything/status"))).json();
    specimen.expect(wildcard.matched).toBe(true);

    const param = await (await handler(new Request("http://localhost/files/readme.txt/download"))).json();
    specimen.expect(param.name).toBe("readme.txt");
  });

  specimen.it("an aperture dispatches by method and 405s the rest", async () => {
    const app = new Aperture();
    app.get("resource", () => "get-result");
    app.post("resource", (input, ctx) => ({ posted: input }));
    const handler = shape.http(app);

    const got = await handler(new Request("http://localhost/resource"));
    specimen.expect(await got.json()).toBe("get-result");

    const posted = await handler(new Request("http://localhost/resource", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: true }),
    }));
    specimen.expect((await posted.json()).posted.data).toBe(true);

    const deleted = await handler(new Request("http://localhost/resource", { method: "DELETE" }));
    specimen.expect(deleted.status).toBe(405);
  });

  specimen.it("a handler streams SSE frames out and reads a raw upload in", async () => {
    const streamer = new Vector();
    streamer.open("events", (ctx) => {
      async function* source() {
        yield { seq: 1 };
        yield { seq: 2 };
        yield "done";
      }
      return ctx.response.publish(source()).body;
    });
    const streamHandler = shape.http(streamer);

    const events = await streamHandler(new Request("http://localhost/events"));
    specimen.expect(events.headers.get("content-type")).toBe("text/event-stream");
    const frames = await events.text();
    specimen.expect(frames).toContain('data: {"seq":1}\n\n');
    specimen.expect(frames).toContain('data: {"seq":2}\n\n');
    specimen.expect(frames).toContain("data: done\n\n");

    const uploader = new Vector();
    uploader.open("upload", async (input, ctx) => {
      const reader = ctx.request.stream().getReader();
      const chunks = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(new TextDecoder().decode(value));
      }
      return { input, chunks };
    });
    const uploadHandler = shape.http(uploader);

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("chunk1"));
        controller.enqueue(new TextEncoder().encode("chunk2"));
        controller.close();
      },
    });
    const uploaded = await uploadHandler(new Request("http://localhost/upload", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body,
    }));
    const result = await uploaded.json();
    specimen.expect(result.input).toBe(null);
    specimen.expect(result.chunks).toEqual(["chunk1", "chunk2"]);
  });
});

specimen.describe("http shape over a served connection", () => {
  const vector = new Vector();
  vector.use(async (ctx, next) => { ctx.state = ctx.state || {}; ctx.state.served = true; await next(); });
  vector.open("ping", () => ({ pong: true }));
  vector.open("echo", (input, ctx) => ({ input, served: ctx.state.served }));
  vector.open("users/:id", (ctx) => ({ id: ctx.params.id }));

  const handler = shape.http(vector);
  const PORT = 9878;
  const abort = new AbortController();

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, handler);
    await sleep.ms(500);
  });

  specimen.afterAll(() => {
    abort.abort();
  });

  specimen.it("a fetch connection calls, passes bodies and params, and 404s", async () => {
    const connection = new Connection(new Url(`http://localhost:${PORT}`));
    specimen.expect(await connection.call("/ping")).toEqual({ pong: true });

    const echoed = await connection.call("/echo", { hello: "world" });
    specimen.expect(echoed.input.hello).toBe("world");
    specimen.expect(echoed.served).toBe(true);

    specimen.expect((await connection.call("/users/42")).id).toBe("42");
    specimen.expect((await connection.fetch("/nonexistent")).status).toBe(404);
  });

  specimen.it("an inline connection calls the same handler without HTTP", async () => {
    const connection = new Connection(new Url("http://internal"), shard.transmitter.inline(handler));
    specimen.expect(await connection.call("/ping")).toEqual({ pong: true });

    const echoed = await connection.call("/echo", { hello: "internal" });
    specimen.expect(echoed.input.hello).toBe("internal");
    specimen.expect(echoed.served).toBe(true);

    specimen.expect((await connection.call("/users/99")).id).toBe("99");
    specimen.expect((await connection.fetch("/nonexistent")).status).toBe(404);
  });
});

specimen.describe("http shape serving static files", () => {
  let tmpDir;

  specimen.beforeAll(async () => {
    tmpDir = await Deno.makeTempDir();
    await Deno.writeTextFile(`${tmpDir}/page.html`, "<p>hi</p>");
    await Deno.writeFile(`${tmpDir}/data.bin`, new Uint8Array([0xCA, 0xFE]));
  });

  specimen.afterAll(async () => {
    await Deno.remove(tmpDir, { recursive: true });
  });

  specimen.it("serves files with correct MIME via remainder", async () => {
    const app = new Aperture();
    app.get("static/(.*)", shard.serve.file(tmpDir));
    const handler = shape.http(app);

    const html = await handler(new Request("http://localhost/static/page.html"));
    specimen.expect(html.status).toBe(200);
    specimen.expect(html.headers.get("content-type")).toBe("text/html");
    specimen.expect(await html.text()).toBe("<p>hi</p>");

    const bin = await handler(new Request("http://localhost/static/data.bin"));
    specimen.expect(bin.headers.get("content-type")).toBe("application/octet-stream");
    await bin.arrayBuffer();

    const missing = await handler(new Request("http://localhost/static/nope"));
    specimen.expect(missing.status).toBe(404);
  });
});
