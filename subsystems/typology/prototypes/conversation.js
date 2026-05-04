import { atom } from "nanostores";
import { strip } from "../gestalten/shape/strip.js";
import { messenger } from "../gestalten/shape/messenger.js";

export const ConversationStateEnum = Object.freeze({
  IDLE: "IDLE",
  OPENING: "OPENING",
  LIVE: "LIVE",
  CLOSING: "CLOSING",
  CLOSED: "CLOSED",
  ERROR: "ERROR",
});

export class Conversation {
  $state = atom(ConversationStateEnum.IDLE);
  $error = atom(null);
  subscribers = new Map();
  send = null;

  constructor(inbound, socket) {
    this.inbound = inbound;
    this.socket = socket;
    this.live = new Promise((resolve) => {
      this._resolveLive = resolve;
    });

    inbound.open("/handshake/open", (ctx) => {
      this.outboundShape = ctx.input.shape;
      this.send = messenger(ctx.input.shape, { socket });
      this.inboundShape = strip(this.inbound);
      this.$state.set(ConversationStateEnum.LIVE);
      this._resolveLive();
      return { shape: this.inboundShape };
    });

    inbound.use(async (ctx, next) => {
      await next();
      const subs = this.subscribers.get(ctx.signal.pathname);
      if (subs) for (const callback of subs) callback(ctx.input);
    });
  }

  async open() {
    this.$state.set(ConversationStateEnum.OPENING);
    this.inboundShape = strip(this.inbound);
    const reply = await this.socket.call("/handshake/open", {
      shape: this.inboundShape,
    });
    this.outboundShape = reply.shape;
    this.send = messenger(reply.shape, { socket: this.socket });
    this.$state.set(ConversationStateEnum.LIVE);
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
    this.$state.set(ConversationStateEnum.CLOSING);
    this.socket?.close?.();
    this.$state.set(ConversationStateEnum.CLOSED);
  }
}
