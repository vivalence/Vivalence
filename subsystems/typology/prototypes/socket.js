import { atom } from "nanostores";
import { Signal, steer, fromm } from "@vivalence/typology";

export const SocketStateEnum = Object.freeze({
  CONNECTING: "CONNECTING",
  OPEN: "OPEN",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  ERROR: "ERROR",
});

export class Socket {
  $state = atom(SocketStateEnum.CONNECTING);
  $error = atom(null);
  state = {};
  pending = new Map();

  // Resolves when the WebSocket is open (immediately if already open — server side).
  // Browser WebSockets start in CONNECTING state; push/call must wait for this.
  #ready;

  constructor(ws, vector) {
    this.ws = ws;
    this.vector = vector;
    if (ws.readyState === 1 /* OPEN */) {
      this.#ready = Promise.resolve();
      this.$state.set(SocketStateEnum.OPEN);
    } else {
      this.#ready = new Promise((resolve, reject) => {
        ws.addEventListener("open",  resolve, { once: true });
        ws.addEventListener("error", reject,  { once: true });
        ws.addEventListener("close", reject,  { once: true });
      });
    }
    ws.addEventListener("open",  () => this.$state.set(SocketStateEnum.OPEN));
    ws.addEventListener("close", (e) => {
      this.$state.set(SocketStateEnum.CLOSED);
      this.#reject(new Error(`socket closed (${e.code}${e.reason ? ` ${e.reason}` : ""})`));
    });
    ws.addEventListener("error", (e) => {
      this.$state.set(SocketStateEnum.ERROR);
      this.$error.set(e);
      this.#reject(new Error("socket error"));
    });
    ws.addEventListener("message", (e) => this.#onmessage(e));
  }

  #reject(error) {
    for (const pending of this.pending.values()) pending.reject?.(error);
    this.pending.clear();
  }

  async #onmessage(event) {
    let frame;
    try { frame = JSON.parse(event.data); } catch { return; }

    if (frame.echo && !frame.signal) {
      this.pending.get(frame.echo)?.resolve(frame.output);
      this.pending.delete(frame.echo);
      return;
    }

    if (!frame.signal) return;

    const signal = new Signal(frame.signal);
    const [effect, carry, steps] = steer.traverse(this.vector, signal);
    if (!effect) return;

    const ctx = {
      socket: this, signal, steps,
      params: fromm.match(steps).parameters,
      input: frame.input,
      output: undefined,
    };
    const output = await steer.direct(carry, effect)(ctx);

    if (frame.echo) {
      this.ws.send(JSON.stringify({ echo: frame.echo, output: output ?? null }));
    }
  }

  push(signal, input) {
    this.#ready.then(() => this.ws.send(JSON.stringify({ signal, input }))).catch(() => {});
  }

  async call(signal, input) {
    await this.#ready;
    const echo = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pending.set(echo, { resolve, reject });
      this.ws.send(JSON.stringify({ signal, input, echo }));
    });
  }

  close() {
    this.$state.set(SocketStateEnum.CLOSING);
    this.ws.close();
  }
}
