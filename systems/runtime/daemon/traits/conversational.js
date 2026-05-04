import { Vector, Queue, shard, Socket, Conversation, soma } from "@vivalence/typology";

export const CONVERSATIONAL = (mode, daemon) => {
  const conversation = new Vector();

  conversation
    .use(shard.ambient.store((ctx) => ({ user: ctx.socket.state.user })))
    .use(async (ctx, next) => {
      await daemon.datamap.shard.context(async () => {
        daemon.datamap.shard.bind("user", () => ({ user: ctx.socket.state.user?.id }));
        await next();
      });
    });

  const vocalized = mode.traits.includes("VOCALIZED");

  conversation.branch("dialogue").open("open", async (ctx) => {
    const live = ctx.socket.state.conversation;
    ctx.socket.state.thread = ctx.input.thread;
    const stream = await mode.harness.dialogue.stream({
      parts: ctx.input.parts,
      thread: ctx.input.thread,
      tune: ctx.input.tune,
    });

    if (!vocalized) {
      for await (const packet of stream) live.send.dialogue.packet(packet);
      live.send.dialogue.close();
      return;
    }

    const [textBranch, audioBranch] = soma.tee(stream);

    const dialoguePath = (async () => {
      for await (const packet of textBranch) live.send.dialogue.packet(packet);
      live.send.dialogue.close();
    })();

    const speechPath = (async () => {
      const speech = daemon.cortex.resolve("speech", {
        tune: ctx.input.tune ?? "eager",
        via: "stream",
      });
      if (!speech) return;
      const textChunks = soma.textFromPackets(audioBranch);
      for await (const packet of speech.via.stream(textChunks, {})) {
        live.send.speech.packet(packet);
      }
      live.send.speech.close({});
    })();

    await Promise.all([
      dialoguePath.catch((error) => live.send.dialogue.error({ message: error.message })),
      speechPath.catch((error) => live.send.speech.error({ message: error.message })),
    ]);
  });

  conversation.branch("dialogue").open("abort", (ctx) => {
    ctx.socket.state.inflight?.get(ctx.input.turn)?.abort();
    ctx.socket.state.conversation.send.speech?.abort?.({});
  });

  if (vocalized) {
    conversation.branch("verbatim").open("packet", (ctx) => {
      const state = ctx.socket.state;
      state.verbatim ??= spinVerbatim(daemon, state, mode);
      state.verbatim.audio.enqueue(ctx.input.audio);
    });

    conversation.branch("verbatim").open("close", (ctx) => {
      ctx.socket.state.verbatim?.audio.close();
      ctx.socket.state.verbatim = null;
    });
  }

  mode.aperture.open(
    "/conversation",
    shard.serve.websocket((ws, ctx) => {
      const connectionVector = new Vector().slurp(conversation);
      const socket = new Socket(ws, connectionVector);
      socket.state.user = ctx.user;
      socket.state.conversation = new Conversation(connectionVector, socket);
    }),
  );
};

function spinVerbatim(daemon, state, mode) {
  const audio = new Queue();
  const asr = daemon.cortex.resolve("verbatim", { tune: "eager", via: "stream" });
  if (!asr) return { audio, asr: null };

  (async () => {
    for await (const event of asr.via.stream(audio.drain(), {})) {
      const send = state.conversation.send;
      if (event.nature === "turn.start" && state.inflight?.size) {
        for (const controller of state.inflight.values()) controller.abort();
        send.speech?.abort?.({});
      }
      send.verbatim?.packet?.(event);
      if (event.nature === "final" && state.thread && mode.config?.autoVoice !== false) {
        mode.harness.dialogue
          .stream({
            parts: [{ type: "text", text: event.transcript }],
            thread: state.thread,
            tune: "eager",
          })
          .catch(() => {});
      }
    }
  })();

  return { audio, asr };
}
