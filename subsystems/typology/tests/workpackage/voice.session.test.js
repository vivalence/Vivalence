import {
  specimen,
  sleep,
  Vector,
  Aperture,
  Socket,
  Session,
  Queue,
  Cortex,
  shard,
  shape,
  soma,
} from "@vivalence/typology";

const { http } = shape;

function stubSpeechFaculty() {
  return {
    type: "speech",
    tune: [0.3, 0.5, 0.5, 0.1],
    context: 0,
    channels: { in: [{ type: "text" }], out: [{ type: "audio" }] },
    via: {
      stream: async function* (textChunks) {
        for await (const chunk of textChunks) {
          yield {
            nature: "packet",
            audio:  "audio:" + chunk,
            pts:    Date.now(),
          };
        }
      },
    },
  };
}

function stubVerbatimFaculty() {
  return {
    type: "verbatim",
    tune: [0.4, 0.6, 0.5, 0.1],
    context: 0,
    channels: { in: [{ type: "audio" }], out: [{ type: "event" }] },
    via: {
      stream: async function* (audioSource) {
        const accumulated = [];
        yield { nature: "turn.start" };
        for await (const chunk of audioSource) {
          accumulated.push(chunk);
          yield { nature: "partial", transcript: accumulated.join("") };
        }
        yield { nature: "final", transcript: accumulated.join("") };
        yield { nature: "turn.end" };
      },
    },
  };
}

function makeMode() {
  const cortex = new Cortex().extend([stubSpeechFaculty(), stubVerbatimFaculty()]);
  const harness = {
    dialogue: {
      stream: async ({ parts }) => {
        const text = parts.find((part) => part.type === "text")?.text ?? "";
        return (async function* () {
          yield* soma.drain({
            role:  "assistant",
            parts: [{ type: "text", text: `echo: ${text}` }],
            meta:  { usage: { input: 1, output: text.length }, stop: "end_turn" },
          });
        })();
      },
    },
  };

  return {
    traits:   ["CONVERSATIONAL", "VOCALIZED"],
    harness,
    aperture: new Aperture(),
    cortex,
  };
}

function CONVERSATIONAL(mode) {
  const conversation = new Vector();
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
      const speech = mode.cortex.resolve("speech", { tune: "eager", via: "stream" });
      if (!speech) return;
      for await (const packet of speech.via.stream(soma.textFromPackets(audioBranch), {})) {
        session.send.speech.packet(packet);
      }
      session.send.speech.close({});
    })();

    await Promise.all([dialoguePath, speechPath]);
  });

  conversation.branch("dialogue").open("voyage", () => {});

  if (vocalized) {
    conversation.branch("verbatim").open("packet", (ctx) => {
      const state = ctx.socket.state;
      state.verbatim ??= (() => {
        const audio = new Queue();
        const asr   = mode.cortex.resolve("verbatim", { tune: "eager", via: "stream" });
        (async () => {
          for await (const event of asr.via.stream(audio.drain(), {})) {
            const send = state.session.send;
            if (event.nature === "turn.start") send.verbatim?.turnStart?.(event);
            if (event.nature === "turn.end")   send.verbatim?.turnEnd?.(event);
            if (event.nature === "partial")    send.verbatim?.partial?.(event);
            if (event.nature === "final")      send.verbatim?.final?.(event);
          }
        })();
        return { audio, asr };
      })();
      state.verbatim.audio.enqueue(ctx.input.audio);
    });

    conversation.branch("verbatim").open("close", (ctx) => {
      ctx.socket.state.verbatim?.audio.close();
    });
  }

  mode.aperture.open(
    "/conversation",
    shard.serve.websocket((ws) => {
      const connectionVector = new Vector().slurp(conversation);
      const socket = new Socket(ws, connectionVector);
      socket.state.session = new Session(connectionVector, socket);
    }),
  );

  return conversation;
}

function makeTerminal(port) {
  const terminal = {
    port,
    session: null,
    streams: {
      dialogue: new Queue(),
      speech:   new Queue(),
      verbatim: {
        partial:   new Queue(),
        final:     new Queue(),
        turnStart: new Queue(),
        turnEnd:   new Queue(),
      },
    },
  };

  terminal.inbound = new Vector();
  terminal.inbound.open("/dialogue/packet",   (ctx) => terminal.streams.dialogue.enqueue(ctx.input));
  terminal.inbound.open("/dialogue/voyage",   () => {});
  terminal.inbound.open("/speech/packet",     (ctx) => terminal.streams.speech.enqueue(ctx.input));
  terminal.inbound.open("/speech/abort",      () => {});
  terminal.inbound.open("/speech/close",      () => {});
  terminal.inbound.open("/verbatim/partial",  (ctx) => terminal.streams.verbatim.partial.enqueue(ctx.input));
  terminal.inbound.open("/verbatim/final",    (ctx) => terminal.streams.verbatim.final.enqueue(ctx.input));
  terminal.inbound.open("/verbatim/turnStart",(ctx) => terminal.streams.verbatim.turnStart.enqueue(ctx.input));
  terminal.inbound.open("/verbatim/turnEnd",  (ctx) => terminal.streams.verbatim.turnEnd.enqueue(ctx.input));

  return terminal;
}

async function activate(terminal) {
  const ws = new WebSocket(`ws://localhost:${terminal.port}/conversation`);
  await new Promise((resolve) => (ws.onopen = resolve));
  const socket = new Socket(ws, terminal.inbound);
  await sleep.ms(20);
  terminal.session = new Session(terminal.inbound, socket);
  await terminal.session.moin();
}

specimen.describe("voice session — dialogue + speech + verbatim", () => {
  const PORT  = 9887;
  const abort = new AbortController();
  const mode  = makeMode();

  CONVERSATIONAL(mode);

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, http(mode.aperture));
    await sleep.ms(100);
  });
  specimen.afterAll(() => abort.abort());

  specimen.it("dialogue anchor fans to /dialogue/packet AND /speech/packet", async () => {
    const terminal = makeTerminal(PORT);
    await activate(terminal);

    terminal.session.send.dialogue.anchor({
      parts: [{ type: "text", text: "oi" }],
    });

    let turn = null;
    for await (const packet of terminal.streams.dialogue) {
      turn = soma.pour(turn, packet);
      if (packet.event === "turn.close") break;
    }
    specimen.expect(turn.role).toBe("assistant");
    specimen.expect(turn.parts[0].text).toBe("echo: oi");

    const audioPacket = await terminal.streams.speech.drain().next();
    specimen.expect(audioPacket.value.nature).toBe("packet");
    specimen.expect(audioPacket.value.audio).toContain("audio:");

    terminal.session.close();
  });

  specimen.it("verbatim packet upstream → partial / final / turn events downstream", async () => {
    const terminal = makeTerminal(PORT);
    await activate(terminal);

    const turnStartP = terminal.streams.verbatim.turnStart.drain().next();
    const partialP   = terminal.streams.verbatim.partial.drain().next();

    terminal.session.send.verbatim.packet({ audio: "oi" });

    const turnStart = await turnStartP;
    specimen.expect(turnStart.value.nature).toBe("turn.start");

    const partial = await partialP;
    specimen.expect(partial.value.transcript).toBe("oi");

    const finalP  = terminal.streams.verbatim.final.drain().next();
    const turnEndP = terminal.streams.verbatim.turnEnd.drain().next();
    terminal.session.send.verbatim.close({});

    const final = await finalP;
    specimen.expect(final.value.transcript).toBe("oi");

    const turnEnd = await turnEndP;
    specimen.expect(turnEnd.value.nature).toBe("turn.end");

    terminal.session.close();
  });
});
