import { Vector, Queue, Session } from "@vivalence/typology";

export const INSITU = async (ctx, next) => {
  await next();
  const terminal = ctx.entity;
  terminal.streams = terminal.streams ?? {};

  terminal.$thread.subscribe(async (thread) => {
    if (terminal.session) {
      terminal.session.close();
      terminal.session = null;
      terminal.socket = null;
    }

    if (!thread?.traits?.includes?.("INSITU")) return;

    const connection = thread.mode?.connection;
    const authority = thread.daemon?.lighthouse?.$authority;
    if (!connection || !authority) return;

    terminal.streams.dialogue = new Queue();

    const clientInbound = new Vector();
    clientInbound.open("/dialogue/packet", (pctx) => {
      terminal.streams.dialogue.enqueue(pctx.input);
    });
    clientInbound.open("/dialogue/voyage", () => {});

    terminal.socket = connection.socket("/conversation", clientInbound, {
      token: authority.get()?.access,
    });

    terminal.session = new Session(clientInbound, terminal.socket);

    try {
      await terminal.session.moin();
    } catch (error) {
      console.error("[INSITU] moin failed:", error);
      terminal.session = null;
      terminal.socket = null;
    }
  });
};
