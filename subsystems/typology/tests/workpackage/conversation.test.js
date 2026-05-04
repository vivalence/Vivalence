import {
  specimen,
  sleep,
  Vector,
  Aperture,
  Socket,
  Conversation,
  Queue,
  shard,
  shape,
  soma,
} from "@vivalence/typology";

const { http } = shape;

// ---------------------------------------------------------------------------
// Server side — minimal mode stub matching the CONVERSATIONAL trait contract.
// mode.harness.dialogue.stream({ parts, thread, tune? }) → async generator of packets.
// ---------------------------------------------------------------------------

function makeMode() {
  const harness = {
    dialogue: {
      stream: async ({ parts }) => {
        const text = parts.find((part) => part.type === "text")?.text ?? "";
        return (async function* () {
          yield* soma.drain({
            role: "assistant",
            parts: [{ type: "text", text: `echo: ${text}` }],
            meta: { usage: { input: 1, output: text.length }, stop: "end_turn" },
          });
        })();
      },
    },
  };

  return { harness, aperture: new Aperture() };
}

function CONVERSATIONAL(mode) {
  const conversation = new Vector();

  conversation.branch("dialogue").open("open", async (ctx) => {
    const live = ctx.socket.state.conversation;
    const stream = await mode.harness.dialogue.stream({
      parts:  ctx.input.parts,
      thread: ctx.input.thread,
      tune:   ctx.input.tune,
    });
    for await (const packet of stream) live.send.dialogue.packet(packet);
    live.send.dialogue.close();
  });

  conversation.branch("dialogue").open("abort", () => {});

  mode.aperture.open(
    "/conversation",
    shard.serve.websocket((ws) => {
      const socket = new Socket(ws, conversation);
      socket.state.conversation = new Conversation(conversation, socket);
    }),
  );

  return conversation;
}

// ---------------------------------------------------------------------------
// Client side — terminal, matching the client-side INSITU + Conversation pattern.
// ---------------------------------------------------------------------------

function makeTerminal(port) {
  const terminal = {
    port,
    traits: [],
    conversation: null,
    streams: {
      dialogue: new Queue(),
      error: new Queue(),
    },
  };

  terminal.inbound = new Vector();
  terminal.inbound.open("/dialogue/packet", (ctx) => terminal.streams.dialogue.enqueue(ctx.input));
  terminal.inbound.open("/dialogue/close", () => { /* turn consumer breaks on turn.close */ });
  terminal.inbound.open("/error/:family", (ctx) =>
    terminal.streams.error.enqueue({ family: ctx.params.family, ...ctx.input }),
  );

  return terminal;
}

async function activateInsitu(terminal) {
  const ws = new WebSocket(`ws://localhost:${terminal.port}/conversation`);
  await new Promise((resolve) => (ws.onopen = resolve));
  const socket = new Socket(ws, terminal.inbound);
  await sleep.ms(20);

  terminal.conversation = new Conversation(terminal.inbound, socket);
  await terminal.conversation.open();
  terminal.traits.push("INSITU");
}

function deactivateInsitu(terminal) {
  terminal.conversation?.close();
  terminal.conversation = null;
  terminal.traits = terminal.traits.filter((trait) => trait !== "INSITU");
}

// ---------------------------------------------------------------------------

specimen.describe("conversation — CONVERSATIONAL × INSITU", () => {
  const PORT = 9885;
  const abort = new AbortController();
  const mode = makeMode();

  CONVERSATIONAL(mode);

  specimen.beforeAll(async () => {
    Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, http(mode.aperture));
    await sleep.ms(100);
  });
  specimen.afterAll(() => abort.abort());

  specimen.it("INSITU on → conversation opens → dialogue turn streams → INSITU off", async () => {
    const terminal = makeTerminal(PORT);

    await activateInsitu(terminal);
    specimen.expect(terminal.traits).toContain("INSITU");
    specimen.expect(terminal.conversation.$state.get()).toBe("LIVE");

    terminal.conversation.send.dialogue.open({
      parts: [{ type: "text", text: "olá" }],
    });

    let turn = null;
    for await (const packet of terminal.streams.dialogue) {
      turn = soma.pour(turn, packet);
      if (packet.event === "turn.close") break;
    }

    specimen.expect(turn.role).toBe("assistant");
    specimen.expect(turn.parts[0].text).toBe("echo: olá");

    deactivateInsitu(terminal);
    specimen.expect(terminal.conversation).toBeNull();
    specimen.expect(terminal.traits).not.toContain("INSITU");
  });
});
