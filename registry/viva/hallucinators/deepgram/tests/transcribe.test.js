import { specimen, sleep } from "@vivalence/typology";
import { transcribe, nova } from "../provider/index.js";

class FakeSocket {
  static OPEN = 1;
  static instances = [];
  readyState = 0;
  sent = [];
  listeners = new Map();
  constructor(url, protocols) {
    this.url = url;
    this.protocols = protocols;
    FakeSocket.instances.push(this);
  }
  addEventListener(kind, handler) {
    this.listeners.set(kind, [...(this.listeners.get(kind) ?? []), handler]);
  }
  dispatch(kind, event = {}) {
    for (const handler of this.listeners.get(kind) ?? []) handler(event);
  }
  open() {
    this.readyState = FakeSocket.OPEN;
    this.dispatch("open");
  }
  send(payload) {
    this.sent.push(payload);
  }
  close(code = 1000) {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatch("close", { code, reason: "" });
  }
}

async function* silence() {}

function run(source, translate = nova) {
  const collected = [];
  let fault = null;
  const done = (async () => {
    try {
      for await (const event of transcribe("wss://fake", [], source, translate, { type: "CloseStream" })) {
        collected.push(event);
      }
    } catch (error) {
      fault = error;
    }
  })();
  return { collected, fault: () => fault, done };
}

specimen.describe("deepgram transcribe — faults are loud, never a clean-looking end", () => {
  let original;

  specimen.beforeAll(() => {
    original = globalThis.WebSocket;
    globalThis.WebSocket = FakeSocket;
  });

  specimen.afterAll(() => {
    globalThis.WebSocket = original;
  });

  specimen.it("a clean 1000 close ends the stream without a fault", async () => {
    FakeSocket.instances = [];
    const flow = run(silence());
    await sleep.ms(1);
    const ws = FakeSocket.instances[0];
    ws.open();
    ws.dispatch("message", { data: JSON.stringify({ type: "Results", is_final: false, channel: { alternatives: [{ transcript: "ciao" }] } }) });
    await sleep.ms(1);
    ws.close(1000);
    await flow.done;
    specimen.expect(flow.collected).toEqual([{ event: "/verbatim/partial", transcript: "ciao" }]);
    specimen.expect(flow.fault()).toBe(null);
  });

  specimen.it("a socket error mid-stream throws instead of ending clean", async () => {
    FakeSocket.instances = [];
    const flow = run(silence());
    await sleep.ms(1);
    const ws = FakeSocket.instances[0];
    ws.open();
    ws.dispatch("message", { data: JSON.stringify({ type: "Results", is_final: false, channel: { alternatives: [{ transcript: "so" }] } }) });
    await sleep.ms(1);
    ws.dispatch("error");
    await flow.done;
    specimen.expect(flow.collected).toEqual([{ event: "/verbatim/partial", transcript: "so" }]);
    specimen.expect(flow.fault()?.message).toContain("socket failed");
  });

  specimen.it("an abnormal close code names itself in the fault", async () => {
    FakeSocket.instances = [];
    const flow = run(silence());
    await sleep.ms(1);
    const ws = FakeSocket.instances[0];
    ws.open();
    ws.dispatch("close", { code: 1011, reason: "timeout" });
    await flow.done;
    specimen.expect(flow.fault()?.message).toContain("1011");
  });

  specimen.it("a malformed audio frame faults the stream loudly, not the process", async () => {
    FakeSocket.instances = [];
    async function* garbage() {
      yield "data-that-is-not-a-packet";
      await sleep.ms(60);
    }
    const flow = run(garbage());
    await sleep.ms(1);
    const ws = FakeSocket.instances[0];
    ws.open();
    await flow.done;
    specimen.expect(flow.collected).toEqual([]);
    specimen.expect(flow.fault()).not.toBe(null);
  });
});
