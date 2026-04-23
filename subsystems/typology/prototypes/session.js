import { atom } from "nanostores";
import { strip } from "../gestalten/shape/strip.js";
import { messenger } from "../gestalten/shape/messenger.js";

export const SessionStateEnum = Object.freeze({
  IDLE: "IDLE",
  MOIN: "MOIN",
  LIVE: "LIVE",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  ERROR: "ERROR",
});

export class Session {
  $state = atom(SessionStateEnum.IDLE);
  $error = atom(null);
  subscribers = new Map();
  send = null;

  constructor(inbound, socket) {
    this.inbound = inbound;
    this.socket = socket;
    this.live = new Promise((resolve) => {
      this._resolveLive = resolve;
    });

    inbound.open("/herald/moin", (ctx) => {
      this.outboundShape = ctx.input.shape;
      this.send = messenger(ctx.input.shape, { socket });
      this.inboundShape = strip(this.inbound);
      this.$state.set(SessionStateEnum.LIVE);
      this._resolveLive();
      return { shape: this.inboundShape };
    });

    inbound.use(async (ctx, next) => {
      await next();
      const subs = this.subscribers.get(ctx.signal.pathname);
      if (subs) for (const callback of subs) callback(ctx.input);
    });
  }

  async moin() {
    this.$state.set(SessionStateEnum.MOIN);
    this.inboundShape = strip(this.inbound);
    const reply = await this.socket.call("/herald/moin", {
      shape: this.inboundShape,
    });
    this.outboundShape = reply.shape;
    this.send = messenger(reply.shape, { socket: this.socket });
    this.$state.set(SessionStateEnum.LIVE);
    this._resolveLive();
    return this;
  }

  subscribe(signal, callback) {
    let set = this.subscribers.get(signal);
    if (!set) this.subscribers.set(signal, (set = new Set()));
    set.add(callback);
    return () => set.delete(callback);
  }

  close() {
    this.$state.set(SessionStateEnum.CLOSING);
    this.socket?.close?.();
    this.$state.set(SessionStateEnum.CLOSED);
  }
}
