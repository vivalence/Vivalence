import { specimen, sleep, Url, Connection } from "@vivalence/typology";
import { Aperture } from "../../prototypes/aperture.js";
import { http } from "../../compiler/http.js";
import { websocket } from "../../shards/websocket.js";

specimen.describe("websocket shard", () => {
  specimen.describe("shape", () => {
    const effect = websocket(() => {});

    specimen.it("is a function", () => {
      specimen.expect(typeof effect).toBe("function");
    });

    specimen.it("has arity 1", () => {
      specimen.expect(effect.length).toBe(1);
    });

    specimen.it("has websocket flag", () => {
      specimen.expect(effect.websocket).toBe(true);
    });
  });

  specimen.describe("lifecycle", () => {
    const app = new Aperture();
    app.get("ws", websocket((socket, ctx) => {
      socket.onmessage = (e) => socket.send(e.data);
    }));
    app.get("health", () => "ok");

    const handler = http(app);
    const PORT = 9881;
    const abort = new AbortController();

    specimen.beforeAll(async () => {
      Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, handler);
      await sleep.ms(100);
    });

    specimen.afterAll(() => {
      abort.abort();
    });

    specimen.it("echoes message over WebSocket", async () => {
      const ws = new WebSocket(`ws://localhost:${PORT}/ws`);
      const opened = new Promise((r) => { ws.onopen = r; });
      await opened;

      const reply = new Promise((r) => { ws.onmessage = (e) => r(e.data); });
      ws.send("ping");
      specimen.expect(await reply).toBe("ping");
      ws.close();
    });

    specimen.it("non-ws route still works", async () => {
      const res = await fetch(`http://localhost:${PORT}/health`);
      specimen.expect(await res.json()).toBe("ok");
    });
  });
});
