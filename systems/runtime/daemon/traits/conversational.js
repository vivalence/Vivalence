import { Vector, Queue, shard, Socket, Session, soma } from "@vivalence/typology";

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

  conversation.branch("dialogue").open("anchor", async (ctx) => {
    const session = ctx.socket.state.session;
    ctx.socket.state.thread = ctx.input.thread;
    const stream = await mode.harness.dialogue.stream({
      parts:  ctx.input.parts,
      thread: ctx.input.thread,
      tune:   ctx.input.tune,
    });

    if (!vocalized) {
      for await (const packet of stream) session.send.dialogue.packet(packet);
      session.send.dialogue.voyage();
      return;
    }

    const [textBranch, audioBranch] = soma.tee(stream);

    const dialoguePath = (async () => {
      for await (const packet of textBranch) session.send.dialogue.packet(packet);
      session.send.dialogue.voyage();
    })();

    const speechPath = (async () => {
      const speech = daemon.cortex.resolve("speech", { tune: ctx.input.tune ?? "eager", via: "stream" });
      if (!speech) return;
      const textChunks = soma.textFromPackets(audioBranch);
      for await (const packet of speech.via.stream(textChunks, {})) {
        session.send.speech.packet(packet);
      }
      session.send.speech.close({});
    })();

    await Promise.all([
      dialoguePath.catch((error) => session.send.dialogue.voyage({ error: error.message })),
      speechPath.catch((error)  => session.send.speech.abort({ error: error.message })),
    ]);
  });

  conversation.branch("dialogue").open("voyage", (ctx) => {
    ctx.socket.state.inflight?.get(ctx.input.turn)?.abort();
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

    conversation.branch("control").open("abort", (ctx) => {
      ctx.socket.state.inflight?.get(ctx.input.turn)?.abort();
      ctx.socket.state.session.send.speech.abort({});
    });
  }

  mode.aperture.open(
    "/conversation",
    shard.serve.websocket((ws, ctx) => {
      console.log("[CONVERSATIONAL] /conversation reached — auth threshold passed, user:", ctx.user?.id ?? "no-auth-ctx");
      const connectionVector = new Vector().slurp(conversation);
      const socket = new Socket(ws, connectionVector);
      socket.state.user    = ctx.user;
      socket.state.session = new Session(connectionVector, socket);
    }),
  );
};

function spinVerbatim(daemon, state, mode) {
  const audio = new Queue();
  const asr   = daemon.cortex.resolve("verbatim", { tune: "eager", via: "stream" });
  if (!asr) return { audio, asr: null };

  (async () => {
    for await (const event of asr.via.stream(audio.drain(), {})) {
      const send = state.session.send;
      if (event.nature === "turn.start") {
        if (state.inflight?.size) {
          for (const controller of state.inflight.values()) controller.abort();
          send.speech?.abort?.({});
        }
        send.verbatim?.turnStart?.(event);
      }
      if (event.nature === "turn.end") send.verbatim?.turnEnd?.(event);
      if (event.nature === "partial")  send.verbatim?.partial?.(event);
      if (event.nature === "final") {
        send.verbatim?.final?.(event);
        if (state.thread && mode.config?.autoVoice !== false) {
          mode.harness.dialogue.stream({
            parts:  [{ type: "text", text: event.transcript }],
            thread: state.thread,
            tune:   "eager",
          }).catch(() => {});
        }
      }
    }
  })();

  return { audio, asr };
}

// @beef THIS is is the new one. we wire the harness into
// #+begin_src js
//   import { Vector, v, shard, shape, belt } from "@vivalence/typology";
//   import { Packet } from "@vivalence/typology/schematics/primitives/hallucination.js";

//   // #beef this is the trait! the trait wires on the
//   export function CONVERSATIONAL(mode, daemon) {
//     const inbound = new Vector()
//       .use(shard.context.attach('daemon', daemon))
//       .use(shard.context.attach('mode', mode));

// - Dialogue signal vocab: =engage / packet / terminate= (was
// open/packet/terminate). Channel open = session LIVE; each =engage= fires one turn.

//     inbound.open("/herald/handshake", (ctx) => {
//       const peerInbound = ctx.input.client;
//       belt.vectorshape.compatible(outbound, peerInbound);
//       ctx.socket.state.peer = peerInbound;
//       ctx.socket.send = shape.messenger(outbound, { socket: ctx.socket });
//       return belt.vectorshape.strip(inbound);
//     });

//     inbound.open("/dialogue/anchor", async (ctx) => {
//       const { mode, thread } = ctx.socket.state;
//       const stream = await mode.harness.dialogue.stream(//...{ thread: thread.id, message: ctx.input.message });
//       for await (const packet of stream) ctx.socket.send.dialogue.packet(packet);
//       ctx.socket.send.dialogue.end({});
//     });

//     inbound.open("/dialogue/abort", (ctx) => { // voyage?
//       ctx.socket.state.dialogue?.inflight?.get(ctx.input.turnId)?.abort();
//     });

//     inbound.open("/speech/anchor", async (ctx) => {
//       const { mode } = ctx.socket.state;
//       const faculty = daemon.cortex.resolve("speech", { tune: mode.cake.tune, via: "synthesize" });
//         // @beef nope this is not how the cortex is used. bro...
//       if (!faculty) return ctx.socket.send.error.speech({ message: "no_speech_faculty" });
//       const stream = faculty.via.synthesize(ctx.input.text);
//       for await (const packet of stream) ctx.socket.send.speech.packet(packet);
//       ctx.socket.send.speech.end({});
//     });

//     inbound.open("/speech/abort", (ctx) => { // voyage?
//       ctx.socket.state.speech?.abort();
//     });

//     inbound.open("/verbatim/packet", (ctx) => {
//       ctx.socket.state.verbatim ??= openTranscriber(daemon, ctx.socket);
//       ctx.socket.state.verbatim.push(ctx.input);
//         // @beef state is overloaded.
//     });

//     inbound.open("/verbatim/close", async (ctx) => { // voyage?
//       const { mode, thread } = ctx.socket.state;
//       const text = ctx.socket.state.verbatim.flush();
//       const stream = await mode.harness.dialogue.stream({ thread: thread.id, message: text });
//       for await (const packet of stream) ctx.socket.send.dialogue.packet(packet);
//       ctx.socket.send.dialogue.end({});
//     });

//     return { inbound, outbound };
//   }
// #+end_src
