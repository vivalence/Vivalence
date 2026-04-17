export const INSITU = async (ctx, next) => {
  // TEARDOWN !
  await next();
  return;
  const terminal = ctx.entity;
  // terminal.streams = { dialogue: new Queue() };

  terminal.$thread.subscribe(async (thread) => {
    // @beef note: thread called once with id/string  later {id,user,mode,...}
    // console.log({ thread });
    // if (terminal.audio) {
    //   // should happen in ??thread??teardown?
    //   terminal.audio.teardown();
    //   terminal.audio = null;
    // }
    // if (terminal.session) {
    //   terminal.session.close();
    //   terminal.session = null;
    //   terminal.$dock.set({ ...terminal.$dock.get(), session: "ended" });
    // }

    if (!thread?.traits?.includes("INSITU")) return;

    const connection = thread.mode?.connection;
    const authority = thread.daemon?.lighthouse?.$authority;
    if (!connection || !authority) return;

    terminal.streams.dialogue = new Queue();
    // terminal.streams.speech = new Queue();
    // terminal.streams.verbatim = {partial: new Queue(), final: new Queue(), turnStart: new Queue(), turnEnd: new Queue(),};

    const clientInbound = new Vector();
    clientInbound.open("/dialogue/packet", (pctx) => terminal.streams.dialogue.enqueue(pctx.input));
    clientInbound.open("/dialogue/voyage", () => {});
    // clientInbound.open("/speech/packet", (pctx) => terminal.streams.speech.enqueue(pctx.input));
    // clientInbound.open("/speech/abort", () => terminal.streams.speech.flush());
    // clientInbound.open("/speech/close", () => {});
    // clientInbound.open("/verbatim/partial", (pctx) => terminal.streams.verbatim.partial.enqueue(pctx.input),); clientInbound.open("/verbatim/final", (pctx) => terminal.streams.verbatim.final.enqueue(pctx.input),); clientInbound.open("/verbatim/turnStart", (pctx) => terminal.streams.verbatim.turnStart.enqueue(pctx.input),); clientInbound.open("/verbatim/turnEnd", (pctx) => terminal.streams.verbatim.turnEnd.enqueue(pctx.input),);

    const socket = connection.socket("/conversation", clientInbound, {
      token: authority.get()?.access,
    });

    terminal.session = new Session(clientInbound, socket);
    // terminal.$dock.set({ ...terminal.$dock.get(), session: "live" });

    try {
      await terminal.session.moin();
    } catch (error) {
      console.error("[TerminalDossier] moin failed:", error);
      terminal.session = null;
      // terminal.$dock.set({ ...terminal.$dock.get(), session: "ended" });
      return;
    } finally {
      console.error("[TerminalDossier] moin finally", { terminal });
    }

    // const audioEnabled = thread.mode?.traits?.includes("VOCALIZED") && thread.trait?.INSITU?.audio?.enabled;

    // if (audioEnabled) {terminal.audio = await wireAudio(terminal, thread);}
  });
};
