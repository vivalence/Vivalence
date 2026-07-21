import { specimen, Url, Connection, Response, Vector, sleep } from "@vivalence/typology";

const stubFetch = (body) => async (ctx) => {
  ctx.response = new Response({ body, status: 200 });
};

specimen.describe("Connection", () => {
  const PORT = 9883;
  const abort = new AbortController();

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, (req) => {
      const url = new URL(req.url);

      if (url.pathname === "/events") {
        const body = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"seq":1}\n\n'));
            controller.enqueue(encoder.encode('data: {"seq":2}\n\n'));
            controller.enqueue(encoder.encode("data: fin\n\n"));
            controller.close();
          },
        });
        return new globalThis.Response(body, {
          headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
        });
      }

      if (url.pathname === "/ingest") {
        const reader = req.body.getReader();
        const decoder = new TextDecoder();
        const received = [];
        return (async () => {
          let buffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const frames = buffer.split("\n\n");
            buffer = frames.pop();
            for (const frame of frames) {
              const line = frame.split("\n").find((l) => l.startsWith("data: "));
              if (!line) continue;
              const payload = line.slice(6);
              try { received.push(JSON.parse(payload)); } catch { received.push(payload); }
            }
          }
          return new globalThis.Response(JSON.stringify({ received }), {
            headers: { "content-type": "application/json" },
          });
        })();
      }

      if (url.pathname === "/relay") {
        return (async () => {
          const payload = await req.json().catch(() => ({}));
          const items = payload.items ?? [];
          const body = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              for (const item of items)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(item)}\n\n`));
              controller.close();
            },
          });
          return new globalThis.Response(body, {
            headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
          });
        })();
      }

      if (url.pathname === "/ws") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        socket.onmessage = (e) => socket.send(`echo:${e.data}`);
        return response;
      }

      return new globalThis.Response("not found", { status: 404 });
    });
    await sleep.ms(100);
  });

  specimen.afterAll(() => {
    abort.abort();
  });

  specimen.it("a connection assembles and branches its tree", () => {
    const connection = new Connection(new Url("http://localhost:1794"), stubFetch({}));
    specimen.expect(connection.url.absolute).toBe("http://localhost:1794/");

    const root = new Connection(new Url("http://api.io"), stubFetch({}));
    const child = root.branch("/users").branch("/123");
    specimen.expect(child.url.absolute).toBe("http://api.io/users/123");

    const rebranched = new Connection(new Url("http://x"), stubFetch({}));
    specimen.expect(rebranched.branch("/emit")).toBe(rebranched.branch("/emit"));
  });

  specimen.it("middleware wraps the fetch and rides the branch tree", async () => {
    const wrapped = [];
    const single = new Connection(new Url("http://localhost:1794"), async (ctx) => {
      wrapped.push("fetch");
      ctx.response = new Response({ status: 200 });
    });
    single.use(async (ctx, next) => {
      wrapped.push("before");
      await next();
      wrapped.push("after");
    });
    await single.call("/test");
    specimen.expect(wrapped).toEqual(["before", "fetch", "after"]);

    const chained = [];
    const stacked = new Connection(new Url("http://x"), stubFetch({ ok: true }))
      .use(async (ctx, next) => {
        chained.push("a");
        await next();
        chained.push("a2");
      })
      .use(async (ctx, next) => {
        chained.push("b");
        await next();
        chained.push("b2");
      });
    await stacked.call("/", {});
    specimen.expect(chained).toEqual(["a", "b", "b2", "a2"]);

    const inherited = [];
    const inheritedRoot = new Connection(new Url("http://x"), stubFetch({ data: 1 }));
    inheritedRoot.use(async (ctx, next) => {
      inherited.push("root");
      await next();
    });
    await inheritedRoot.branch("/api").call("/test", {});
    specimen.expect(inherited).toEqual(["root"]);

    const traversed = [];
    const traversedRoot = new Connection(new Url("http://x"), stubFetch({ ok: true }));
    traversedRoot.branch("/emit").use(async (ctx, next) => {
      traversed.push("emit-mw");
      await next();
    });
    await traversedRoot.call("/emit/playground/spawn", {});
    specimen.expect(traversed).toEqual(["emit-mw"]);

    const shared = [];
    const sharedRoot = new Connection(new Url("http://x"), stubFetch({ ok: true }));
    sharedRoot.branch("/emit").use(async (ctx, next) => {
      shared.push("emit-mw");
      await next();
    });
    await sharedRoot.branch("/emit").call("/spawn", {});
    specimen.expect(shared).toEqual(["emit-mw"]);

    const late = [];
    const lateRoot = new Connection(new Url("http://x"), stubFetch({}));
    const lateChild = lateRoot.branch("/api");
    lateRoot.use(async (ctx, next) => {
      late.push("late-root");
      await next();
    });
    await lateChild.call("/x", {});
    specimen.expect(late).toEqual(["late-root"]);

    const covered = [];
    const coveredRoot = new Connection(new Url("http://x"), stubFetch({}));
    coveredRoot.branch("/emit").use(async (ctx, next) => {
      covered.push("emit");
      await next();
    });
    await coveredRoot.branch("/emit/spawn").call("/", {});
    specimen.expect(covered).toEqual(["emit"]);

    const siblings = [];
    const siblingRoot = new Connection(new Url("http://x"), stubFetch({}));
    siblingRoot.branch("/emit").use(async (ctx, next) => {
      siblings.push("emit");
      await next();
    });
    await siblingRoot.branch("/other").call("/", {});
    specimen.expect(siblings).toEqual([]);

    const nested = [];
    const nestedRoot = new Connection(new Url("http://x"), stubFetch({}));
    nestedRoot.use(async (ctx, next) => {
      nested.push("root");
      await next();
      nested.push("root-after");
    });
    nestedRoot.branch("/emit").use(async (ctx, next) => {
      nested.push("emit");
      await next();
      nested.push("emit-after");
    });
    await nestedRoot.branch("/emit").call("/", {});
    specimen.expect(nested).toEqual(["emit", "root", "root-after", "emit-after"]);
  });

  specimen.it("a call carries a body and shapes the response", async () => {
    const answering = new Connection(new Url("http://x"), stubFetch({ result: 42 }));
    specimen.expect(await answering.call("/endpoint", { input: 1 })).toEqual({ result: 42 });

    let captured;
    const capturing = new Connection(new Url("http://x"), async (ctx) => {
      captured = ctx.request.body;
      ctx.response = new Response({ status: 200 });
    });
    await capturing.call("/", { foo: "bar" });
    specimen.expect(captured).toEqual({ foo: "bar" });

    const transforming = new Connection(new Url("http://x"), async (ctx) => {
      ctx.response = new Response({ body: { value: 1 }, status: 200 });
    })
      .use(async (ctx, next) => {
        await next();
        ctx.response.body.value += 10;
      })
      .use(async (ctx, next) => {
        await next();
        ctx.response.body.value *= 2;
      });
    const transformed = await transforming.call("/", {});
    specimen.expect(transformed.value).toBe(12);
  });

  specimen.it("a stream pours server events into the client", async () => {
    const connection = new Connection(new Url(`http://localhost:${PORT}`));

    const controller = new AbortController();
    const signalled = [];
    for await (const event of connection.stream("/events", controller.signal)) {
      signalled.push(event);
    }
    specimen.expect(signalled).toEqual([{ seq: 1 }, { seq: 2 }, "fin"]);

    const posted = [];
    for await (const event of connection.stream("/relay", undefined, {
      method: "POST",
      body: { items: [{ n: 1 }, { n: 2 }, "done"] },
    })) {
      posted.push(event);
    }
    specimen.expect(posted).toEqual([{ n: 1 }, { n: 2 }, "done"]);

    const defaulted = [];
    for await (const event of connection.stream("/events", undefined)) defaulted.push(event);
    specimen.expect(defaulted).toEqual([{ seq: 1 }, { seq: 2 }, "fin"]);

    const iterator = connection.observe("/events");
    specimen.expect(typeof iterator.unsubscribe).toBe("function");
    const observed = [];
    for await (const event of iterator) {
      observed.push(event);
    }
    specimen.expect(observed).toEqual([{ seq: 1 }, { seq: 2 }, "fin"]);

    const subscribed = [];
    const unsubscribe = connection.subscribe("/events", (event) => {
      subscribed.push(event);
    });
    specimen.expect(typeof unsubscribe).toBe("function");
    await sleep.ms(200);
    unsubscribe();
    specimen.expect(subscribed).toEqual([{ seq: 1 }, { seq: 2 }, "fin"]);
  });

  specimen.it("a publish and a socket round-trip the wire", async () => {
    const connection = new Connection(new Url(`http://localhost:${PORT}`));

    async function* source() {
      yield { a: 1 };
      yield { b: 2 };
      yield "end";
    }
    const result = await connection.publish("/ingest", source());
    specimen.expect(result).toEqual({ received: [{ a: 1 }, { b: 2 }, "end"] });

    const socket = connection.socket("/ws", new Vector());
    const opened = new Promise((resolve) => { socket.ws.onopen = resolve; });
    await opened;
    const reply = new Promise((resolve) => { socket.ws.onmessage = (event) => resolve(event.data); });
    socket.ws.send("hello");
    specimen.expect(await reply).toBe("echo:hello");
    socket.close();
  });
});
