import { atom } from "nanostores";
import { Aperture, Controller, Path, Socket, Span, Vector, control, shape, shard, sleep, specimen, steer } from "@vivalence/typology";
import { accio } from "@vivalence/runtime/scenarios";
import * as ghost from "@vivalence/ghost";

const { modes } = ghost.client.lifecycle;
const execution = new Vector().use(shard.controller.open).use(modes).do(shard.controller.hold);

const boot = async (id) => {
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const root = new Controller({ stdout: new Span("ghost") });
  const register = { modes: [await accio({ module: "@commons/home/console", reference: new Path("/mode/home/console") })] };
  const client = new ghost.client.Client({ controller: root.branch("client"), mask, register, instance: null });
  const held = steer.dispatch.execute(execution, client);
  await control.controlled(client.controller);
  const terminal = Object.assign(new ghost.terminal.Terminal(), { id, index: 0, client, controller: client.controller.branch(`terminal/${id}`) });
  client.runtime = { entities: { mode: { $entities: atom([]) }, terminal: { $entities: atom([terminal]) } } };
  terminal.runtime = client.runtime;
  return { client, terminal, held };
};

const wire = async (vector) => {
  const abort = new AbortController();
  const mount = new Aperture();
  mount.get("connect", shard.serve.websocket((websocket) => new Socket(websocket, vector)));
  const server = Deno.serve({ port: 0, hostname: "127.0.0.1", signal: abort.signal, onListen() {} }, shape.http(mount));
  const websocket = new WebSocket(`ws://127.0.0.1:${server.addr.port}/connect`);
  await new Promise((resolve) => (websocket.onopen = resolve));
  const socket = new Socket(websocket, new Vector());
  await sleep.ms(20);
  return {
    socket,
    close: async () => {
      socket.close();
      abort.abort();
      await server.finished;
    },
  };
};

specimen.describe("LOOPING on the client — /terminal/:terminal/… answers the runtime over a real socket on client.aperture", { sanitizeResources: false, sanitizeOps: false }, () => {
  let first;
  let second;
  let line;

  specimen.beforeAll(async () => {
    first = await boot("t1");
    second = await boot("t2");
    line = await wire(first.client.aperture);
  });
  specimen.afterAll(async () => {
    await line.close();
    for (const booted of [first, second]) {
      booted.client.controller.kill("SIGTERM", "test over");
      await booted.held;
    }
  });

  specimen.it("/terminal/t1/repl DISPATCHES the posted Signal { nature, body, flags } on the terminal; the verb's output is the answer", async () => {
    specimen.expect(await line.socket.call("/terminal/t1/repl", { nature: "/hello", body: [], flags: {} })).toBe("hello from ghost");
  });

  specimen.it("/terminal/t1/metadata/repl strips the composed ring: the client's help and the hosted mode's hello · whoami beside the terminal's own; off a tty no quit; with no app no terminal", async () => {
    const strip = await line.socket.call("/terminal/t1/metadata/repl");
    specimen.expect(Object.keys(strip.branches)).toEqual(specimen.expect.arrayContaining(["help", "hello", "whoami", "dock"]));
    specimen.expect(Object.keys(strip.branches)).not.toContain("quit");
    specimen.expect(Object.keys(strip.branches)).not.toContain("terminal");
    specimen.expect(strip.branches.hello.effect.valence).toMatch(/Example: \/hello/);
  });

  specimen.it("an unknown terminal is NotFound", async () => {
    await specimen.expect(line.socket.call("/terminal/nope/repl", { nature: "/hello", body: [], flags: {} })).rejects.toThrow();
  });

  specimen.it("a second looping mount on the same client grafts nothing — the terminal middleware stays one tap", () => {
    first.client.looping(first.client);
    specimen.expect(first.client.aperture.branch("/terminal/:terminal").carry).toHaveLength(1);
  });

  specimen.it("a second client in the same process carries its OWN loop routes — once per client, not per process", async () => {
    const other = await wire(second.client.aperture);
    try {
      specimen.expect(await other.socket.call("/terminal/t2/repl", { nature: "/hello", body: [], flags: {} })).toBe("hello from ghost");
    } finally {
      await other.close();
    }
  });

  specimen.it("a bare line posted to /terminal/t1/repl on a HARNESSED seat rides the harness request with terminal t1, its thread and a minted turn", async () => {
    const requests = [];
    const merged = [];
    const mode = {
      id: "m1",
      type: "home",
      slug: "harnessed",
      repl: new Vector(),
      keymap: new Vector(),
      implements: (name) => name === "HARNESSED",
      harness: {
        dialogue: {
          stream: async function* (request) {
            requests.push(request);
            yield { event: "/turn/open", turn: { role: "user", id: request.turn } };
          },
        },
      },
    };
    first.client.runtime.entities.turn = { merge: async (turn) => merged.push(turn) };
    first.terminal.thread = { id: "th1", mode, $buffers: atom([{ id: "b1" }]), $phase: atom("manual") };
    try {
      await line.socket.call("/terminal/t1/repl", { nature: "*", body: [{ type: "text", text: "ciao" }], flags: {} });
    } finally {
      first.terminal.thread = null;
    }
    specimen.expect(requests).toEqual([{ thread: "th1", terminal: "t1", turn: specimen.expect.stringMatching(/^[0-9a-f-]{36}$/), parts: [{ type: "text", text: "ciao" }] }]);
    specimen.expect(merged).toEqual([{ role: "user", id: requests[0].turn, parts: [], thread: "th1", mode: "m1" }]);
  });
});
