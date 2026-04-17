import { specimen, sleep, Vector, Aperture, Socket, shard, shape } from "@vivalence/typology";

const { http } = shape;

specimen.describe("Socket", () => {
  const PORT = 9883;
  const abort = new AbortController();
  const logged = [];
  let serverSocket = null;

  const serverApp = new Vector();
  serverApp.open("echo",   (ctx) => ({ echo: ctx.input }));
  serverApp.open("log",    (ctx) => { logged.push(ctx.input); });
  serverApp.open("pingme", (ctx) => {
    ctx.socket.push("pushed", { msg: "hi" });
    return { ok: true };
  });
  serverApp.open("set", (ctx) => { ctx.socket.state.x = ctx.input.x; return { ok: true }; });
  serverApp.open("get", (ctx) => ({ x: ctx.socket.state.x }));

  const mount = new Aperture();
  mount.get("connect", shard.serve.websocket((ws) => {
    serverSocket = new Socket(ws, serverApp);
  }));

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, http(mount));
    await sleep.ms(100);
  });
  specimen.afterAll(() => abort.abort());

  specimen.it("call() awaits a correlated reply", async () => {
    const ws = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((r) => { ws.onopen = r; });
    const socket = new Socket(ws, new Vector());
    await sleep.ms(20);

    const reply = await socket.call("echo", { text: "hello" });
    specimen.expect(reply).toEqual({ echo: { text: "hello" } });
    socket.close();
  });

  specimen.it("push() sends a frame without awaiting a reply", async () => {
    const ws = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((r) => { ws.onopen = r; });
    const socket = new Socket(ws, new Vector());
    await sleep.ms(20);

    socket.push("log", { msg: "tick" });
    await sleep.ms(50);
    specimen.expect(logged).toContainEqual({ msg: "tick" });
    socket.close();
  });

  specimen.it("server-initiated push dispatches through client vector", async () => {
    const received = [];
    const clientApp = new Vector();
    clientApp.open("pushed", (ctx) => { received.push(ctx.input); });

    const ws = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((r) => { ws.onopen = r; });
    const socket = new Socket(ws, clientApp);
    await sleep.ms(20);

    await socket.call("pingme", {});
    await sleep.ms(50);

    specimen.expect(received).toContainEqual({ msg: "hi" });
    socket.close();
  });

  specimen.it("ctx.socket.state persists across frames on same connection", async () => {
    const ws = new WebSocket(`ws://localhost:${PORT}/connect`);
    await new Promise((r) => { ws.onopen = r; });
    const socket = new Socket(ws, new Vector());
    await sleep.ms(20);

    await socket.call("set", { x: 42 });
    const got = await socket.call("get", {});
    specimen.expect(got).toEqual({ x: 42 });
    socket.close();
  });
});
