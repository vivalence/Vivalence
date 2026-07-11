import { atom } from "nanostores";
import { Span, Context, Url, Queue, ConnectionError, NotFound, steer, fromm, v } from "@vivalence/typology";

const encoder = new TextEncoder();

let signalCodecMemo;
const signalCodec = () => (signalCodecMemo ??= v.prototypes.Signal());

export const SocketStateEnum = Object.freeze({
  CONNECTING: "CONNECTING",
  OPEN: "OPEN",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  ERROR: "ERROR",
});

function frameError(fault) {
  const failure =
    ConnectionError.fromStatus(fault?.status ?? 0, { body: fault }) ??
    ConnectionError.network(fault?.message ?? "frame failed");
  failure.status = fault?.status ?? 0;
  return failure;
}

export class Socket {
  $state = atom(SocketStateEnum.CONNECTING);
  $error = atom(null);
  state = {};
  frames = new Map();
  lines = new Map();
  span = new Span("socket");

  // Resolves when the WebSocket is open (immediately if already open — server side).
  // Browser WebSockets start in CONNECTING state; push/open must wait for this.
  #ready;

  constructor(ws, vector, options = {}) {
    this.ws = ws;
    this.vector = vector;
    this.bearer = options.bearer ?? null;
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
    this.#ready.catch(() => {});
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
    for (const frame of this.frames.values()) {
      frame.enqueue({ error: { message: error.message } });
      frame.close();
    }
    this.frames.clear();
    for (const line of this.lines.values()) line.controller.abort();
    this.lines.clear();
  }

  #send(packet) {
    if (this.ws.readyState === 1) this.ws.send(JSON.stringify(packet));
  }

  #wire(signal) {
    return typeof signal === "string" ? signal : v.encode(signalCodec(), signal);
  }

  async #onmessage(event) {
    let packet;
    try { packet = JSON.parse(event.data); } catch { this.span.note({ drop: "parse" }); return; }
    if (!v.primitives.connection.Packet.check(packet)) {
      console.warn(`[multiplex] rejected malformed packet`, packet);
      return void this.span.note({ drop: "malformed", packet });
    }

    if (packet.frame !== undefined) {
      if (packet.signal) return void this.#answer(packet);

      const frame = this.frames.get(packet.frame);
      if (frame) {
        frame.enqueue(packet);
        if (packet.close || packet.error) {
          this.frames.delete(packet.frame);
          frame.close();
        }
        return;
      }

      const line = this.lines.get(packet.frame);
      if (!line) return void this.span.note({ drop: "orphan-frame", frame: packet.frame });
      if (packet.input !== undefined) line.upstream?.enqueue(encoder.encode(packet.input));
      else if (packet.done) {
        line.upstream?.close();
        line.upstream = null;
      } else if (packet.close) {
        line.controller.abort();
        this.lines.delete(packet.frame);
      }
      return;
    }

    if (!packet.signal) return void this.span.note({ drop: "empty" });

    let signal;
    try { signal = v.decode(signalCodec(), packet.signal); }
    catch {
      console.warn(`[multiplex] rejected bad signal "${packet.signal}"`);
      return void this.span.note({ drop: "bad-signal", signal: packet.signal });
    }
    const [effect, carry, steps] = steer.dispatch.traverse(this.vector, signal);
    if (!effect) {
      console.warn(`[multiplex] no route for push "${packet.signal}"`);
      return void this.span.note({ drop: "no-route", signal: packet.signal });
    }

    const ctx = new Context({ request: { url: `http://socket${signal.pathname}`, body: packet.input } });
    ctx.socket = this;
    ctx.signal = signal;
    ctx.steps = steps;
    ctx.params = fromm.match(steps).parameters;
    await steer.strategy.direct(carry, effect)(ctx);
  }

  async #answer(packet) {
    const id = packet.frame;
    const trace = this.span.branch(packet.signal);
    trace.open();
    const controller = new AbortController();
    const line = { controller, upstream: null };
    this.lines.set(id, line);

    try {
      const signal = v.decode(signalCodec(), packet.signal);
      const [effect, carry, steps] = steer.dispatch.traverse(this.vector, signal);
      if (!effect) {
        console.warn(`[multiplex] no route for "${signal.pathname}"`);
        trace.mark("error", { status: 404 });
        return this.#send({ frame: id, error: { status: 404, message: `not found ${signal.pathname}` } });
      }

      const destination = new Url(`http://socket${signal.pathname}${packet.query ?? ""}`);
      const token = packet.token ?? this.bearer;
      const ctx = new Context({
        request: {
          url: destination.href,
          method: packet.verb ?? "POST",
          headers: token ? { authorization: `Bearer ${token}` } : {},
          body: packet.input,
        },
      });
      ctx.socket = this;
      ctx.signal = signal;
      ctx.steps = steps;
      ctx.params = fromm.match(steps).parameters;
      ctx.request.raw = packet.stream
        ? {
            signal: controller.signal,
            body: new ReadableStream({
              start: (feed) => {
                line.upstream = feed;
              },
            }),
          }
        : { signal: controller.signal };

      await carry(ctx, async (inner) => {
        const output = await steer.strategy.fire(effect, inner);
        if (output !== undefined) inner.output = output;
      });

      const body = ctx.response.body;
      if (ctx.response.error || ctx.response.status >= 400) {
        const status = ctx.response.status || 500;
        trace.mark("error", { status });
        this.#send({
          frame: id,
          error: { status, message: body?.error?.message ?? "request failed" },
        });
      } else if (
        body?.[Symbol.asyncIterator] &&
        typeof body !== "string" &&
        typeof body.getReader !== "function"
      ) {
        this.#send({ frame: id, open: true });
        for await (const item of body) {
          if (controller.signal.aborted) return void trace.note({ aborted: true });
          this.#send({ frame: id, output: item });
        }
        this.#send({ frame: id, close: true });
        trace.close();
      } else {
        this.#send({ frame: id, output: body ?? null });
        this.#send({ frame: id, close: true });
        trace.close();
      }
    } catch (error) {
      trace.fault(error);
      if (error instanceof NotFound || error?.code === "NOT_FOUND") {
        this.#send({ frame: id, error: { status: 404, message: error.message } });
      } else if (!controller.signal.aborted) {
        console.error(`[multiplex] "${packet.signal}" failed`, error);
        this.#send({ frame: id, error: { status: 500, message: error.message } });
      }
    } finally {
      this.lines.delete(id);
    }
  }

  push(signal, input) {
    this.#ready
      .then(() => this.ws.send(JSON.stringify({ signal: this.#wire(signal), input })))
      .catch(() => {});
  }

  async open(signal, { query, input, verb, token, stream } = {}) {
    await this.#ready;
    const frame = new Queue();
    frame.id = crypto.randomUUID();
    this.frames.set(frame.id, frame);
    this.ws.send(
      JSON.stringify({
        frame: frame.id,
        signal: this.#wire(signal),
        ...(query && { query }),
        ...(input !== undefined && { input }),
        ...(verb && verb !== "POST" && { verb }),
        ...(token && { token }),
        ...(stream && { stream: true }),
      }),
    );
    return frame;
  }

  async *flow(frame, { arrived, signal } = {}) {
    for await (const packet of frame.drain(signal)) {
      if (packet.error) throw frameError(packet.error);
      if (packet.open) {
        arrived?.();
        continue;
      }
      if (packet.close) return;
      if ("output" in packet) yield packet.output;
    }
  }

  async call(signal, input) {
    const frame = await this.open(signal, { input });
    try {
      for await (const output of this.flow(frame)) return output;
      return undefined;
    } finally {
      this.frames.delete(frame.id);
    }
  }

  async feed(frame, body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = typeof value === "string" ? value : decoder.decode(value, { stream: true });
        if (this.ws.readyState !== 1) return;
        this.ws.send(JSON.stringify({ frame: frame.id, input: chunk }));
      }
      this.#send({ frame: frame.id, done: true });
    } catch {
      this.shut(frame);
    }
  }

  shut(frame) {
    this.frames.delete(frame.id);
    frame.close();
    this.#send({ frame: frame.id, close: true });
  }

  forget(frame) {
    this.frames.delete(frame.id);
  }

  close() {
    this.$state.set(SocketStateEnum.CLOSING);
    this.ws.close();
  }
}
