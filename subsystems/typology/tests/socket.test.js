import { specimen, sleep, Vector, Aperture, Socket, shard, shape } from "@vivalence/typology";

specimen.describe("Socket", () => {
  const PORT = 9883;
  const abort = new AbortController();
  const logged = [];

  const serverApp = new Vector();
  serverApp.open("echo", (ctx) => ({ echo: ctx.input }));
  serverApp.open("log", (ctx) => {
    logged.push(ctx.input);
  });
  serverApp.open("pingme", (ctx) => {
    ctx.socket.push("pushed", { msg: "hi" });
    return { ok: true };
  });
  serverApp.open("set", (ctx) => {
    ctx.socket.state.x = ctx.input.x;
    return { ok: true };
  });
  serverApp.open("get", (ctx) => ({ x: ctx.socket.state.x }));

  const mount = new Aperture();
  mount.get("connect", shard.serve.websocket((websocket) => new Socket(websocket, serverApp)));

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, shape.http(mount));
    await sleep.ms(100);
  });
  specimen.afterAll(() => abort.abort());

  specimen.it("a call awaits its correlated reply and state survives the frames", async () => {
    const websocket = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((resolve) => {
      websocket.onopen = resolve;
    });
    const socket = new Socket(websocket, new Vector());
    await sleep.ms(20);

    const reply = await socket.call("echo", { text: "hello" });
    specimen.expect(reply).toEqual({ echo: { text: "hello" } });

    await socket.call("set", { x: 42 });
    const answered = await socket.call("get", {});
    specimen.expect(answered).toEqual({ x: 42 });
    socket.close();
  });

  specimen.it("a push crosses without awaiting a reply", async () => {
    const websocket = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((resolve) => {
      websocket.onopen = resolve;
    });
    const socket = new Socket(websocket, new Vector());
    await sleep.ms(20);

    socket.push("log", { msg: "tick" });
    await sleep.ms(50);
    specimen.expect(logged).toContainEqual({ msg: "tick" });
    socket.close();
  });

  specimen.it("a server push lands in the client vector", async () => {
    const received = [];
    const clientApp = new Vector();
    clientApp.open("pushed", (ctx) => {
      received.push(ctx.input);
    });

    const websocket = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((resolve) => {
      websocket.onopen = resolve;
    });
    const socket = new Socket(websocket, clientApp);
    await sleep.ms(20);

    await socket.call("pingme", {});
    await sleep.ms(50);

    specimen.expect(received).toContainEqual({ msg: "hi" });
    socket.close();
  });
});
