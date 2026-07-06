import {
  specimen,
  sleep,
  Vector,
  Aperture,
  Socket,
  Conversation,
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
  const cortex = new Cortex().register([stubSpeechFaculty(), stubVerbatimFaculty()]);
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

  conversation.branch("dialogue").open("open", async (ctx) => {
    const live = ctx.socket.state.conversation;
    ctx.socket.state.thread = ctx.input.thread;
    const stream = await mode.harness.dialogue.stream({
      parts:  ctx.input.parts,
      thread: ctx.input.thread,
      tune:   ctx.input.tune,
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
      const speech = mode.cortex.findOne({ type: "speech", tune: "eager", via: "stream" });
      if (!speech) return;
      for await (const packet of speech.via.stream(soma.textFromPackets(audioBranch), {})) {
        live.send.speech.packet(packet);
      }
      live.send.speech.close({});
    })();

    await Promise.all([dialoguePath, speechPath]);
  });

  conversation.branch("dialogue").open("abort", () => {});

  if (vocalized) {
    conversation.branch("verbatim").open("packet", (ctx) => {
      const state = ctx.socket.state;
      state.verbatim ??= (() => {
        const audio = new Queue();
        const asr   = mode.cortex.findOne({ type: "verbatim", tune: "eager", via: "stream" });
        (async () => {
          for await (const event of asr.via.stream(audio.drain(), {})) {
            state.conversation.send.verbatim?.packet?.(event);
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
      socket.state.conversation = new Conversation(connectionVector, socket);
    }),
  );

  return conversation;
}

function makeTerminal(port) {
  const terminal = {
    port,
    conversation: null,
    streams: {
      dialogue: new Queue(),
      speech:   new Queue(),
      verbatim: new Queue(),
    },
  };

  terminal.inbound = new Vector();
  terminal.inbound.open("/dialogue/packet", (ctx) => terminal.streams.dialogue.enqueue(ctx.input));
  terminal.inbound.open("/dialogue/close",  () => {});
  terminal.inbound.open("/speech/packet",   (ctx) => terminal.streams.speech.enqueue(ctx.input));
  terminal.inbound.open("/speech/abort",    () => {});
  terminal.inbound.open("/speech/close",    () => {});
  terminal.inbound.open("/verbatim/packet", (ctx) => terminal.streams.verbatim.enqueue(ctx.input));

  return terminal;
}

async function activate(terminal) {
  const ws = new WebSocket(`ws://localhost:${terminal.port}/conversation`);
  await new Promise((resolve) => (ws.onopen = resolve));
  const socket = new Socket(ws, terminal.inbound);
  await sleep.ms(20);
  terminal.conversation = new Conversation(terminal.inbound, socket);
  await terminal.conversation.open();
}

specimen.describe("voice conversation — dialogue + speech + verbatim", () => {
  const PORT  = 9887;
  const abort = new AbortController();
  const mode  = makeMode();

  CONVERSATIONAL(mode);

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, http(mode.aperture));
    await sleep.ms(100);
  });
  specimen.afterAll(() => abort.abort());

  specimen.it("dialogue open fans to /dialogue/packet AND /speech/packet", async () => {
    const terminal = makeTerminal(PORT);
    await activate(terminal);

    terminal.conversation.send.dialogue.open({
      parts: [{ type: "text", text: "oi" }],
    });

    let turn = null;
    for await (const packet of terminal.streams.dialogue) {
      turn = soma.pour(turn, packet);
      if (packet.event === "/turn/close") break;
    }
    specimen.expect(turn.role).toBe("assistant");
    specimen.expect(turn.parts[0].text).toBe("echo: oi");

    const audioPacket = await terminal.streams.speech.drain().next();
    specimen.expect(audioPacket.value.nature).toBe("packet");
    specimen.expect(audioPacket.value.audio).toContain("audio:");

    terminal.conversation.close();
  });

  specimen.it("verbatim packet upstream → discriminated packets downstream", async () => {
    const terminal = makeTerminal(PORT);
    await activate(terminal);

    const drain = terminal.streams.verbatim.drain();

    terminal.conversation.send.verbatim.packet({ audio: "oi" });

    const turnStart = await drain.next();
    specimen.expect(turnStart.value.nature).toBe("turn.start");

    const partial = await drain.next();
    specimen.expect(partial.value.nature).toBe("partial");
    specimen.expect(partial.value.transcript).toBe("oi");

    terminal.conversation.send.verbatim.close({});

    const final = await drain.next();
    specimen.expect(final.value.nature).toBe("final");
    specimen.expect(final.value.transcript).toBe("oi");

    const turnEnd = await drain.next();
    specimen.expect(turnEnd.value.nature).toBe("turn.end");

    terminal.conversation.close();
  });
});
