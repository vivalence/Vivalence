// Thin REPL client for cortex testing
// stdin/stdout interactive shell. Takes a compiled mode.harness.
//
// Commands:
//   /tune <tier>       — switch tune (frugal/balanced/capable/unleashed)
//   /stream            — toggle streaming mode
//   /speech <text>     — synthesize speech
//   /history           — show turn history
//   /quit              — exit
//   anything else      — send as conversation message

import { accumulate } from "../typology/accumulate.js";

export function repl(harness, options = {}) {
  let tune = options.tune ?? "balanced";
  let streaming = options.stream ?? false;
  let head = null; // parent turn id for threading
  const history = []; // local turn log

  const write = (text) => Deno.stdout.writeSync(new TextEncoder().encode(text));
  const writeln = (text) => write(text + "\n");

  async function handleMessage(text) {
    const userTurn = { role: "user", parts: [{ type: "text", text }] };

    if (streaming && harness.conversation?.stream) {
      write("\x1b[2m"); // dim
      const stream = await harness.conversation.stream({
        parent: head,
        turn: userTurn,
        turns: [userTurn],
        tune,
      });
      let turn = null;
      for await (const packet of stream) {
        turn = accumulate(turn, packet);
        if (packet.event === "part.delta" && packet.delta.text) {
          write(packet.delta.text);
        }
      }
      write("\x1b[0m\n"); // reset
      if (turn) {
        history.push(userTurn, turn);
        head = turn.id ?? head;
      }
    } else {
      const turn = await harness.conversation.render({
        parent: head,
        turn: userTurn,
        turns: [userTurn],
        tune,
      });
      const text = turn.parts?.find((p) => p.type === "text")?.text ?? JSON.stringify(turn.parts);
      writeln(text);
      history.push(userTurn, turn);
      head = turn.id ?? head;
    }
  }

  async function handleSpeech(text) {
    if (!harness.speech?.render) {
      writeln("no speech faculty available");
      return;
    }
    const turn = await harness.speech.render({
      turns: [{ role: "user", parts: [{ type: "text", text }] }],
      tune,
    });
    const audio = turn.parts?.find((p) => p.type === "audio");
    if (audio) {
      writeln(`[audio] ${audio.media} (${audio.data.length} bytes encoded)`);
    } else {
      writeln(JSON.stringify(turn.parts));
    }
  }

  function handleCommand(line) {
    const [cmd, ...args] = line.trim().split(/\s+/);
    const arg = args.join(" ");

    switch (cmd) {
      case "/tune":
        if (arg) tune = arg;
        writeln(`tune: ${tune}`);
        return true;
      case "/stream":
        streaming = !streaming;
        writeln(`streaming: ${streaming ? "on" : "off"}`);
        return true;
      case "/speech":
        if (!arg) { writeln("usage: /speech <text>"); return true; }
        handleSpeech(arg);
        return true;
      case "/history":
        for (const t of history) {
          const text = t.parts?.find((p) => p.type === "text")?.text ?? "...";
          writeln(`  [${t.role}] ${text.slice(0, 80)}`);
        }
        return true;
      case "/quit":
        return "quit";
      default:
        return false;
    }
  }

  return {
    // for programmatic use in tests
    send: handleMessage,
    speech: handleSpeech,
    command: handleCommand,

    // interactive loop
    async run() {
      writeln("cortex repl — /tune /stream /speech /history /quit");
      writeln(`tune: ${tune} | streaming: ${streaming}`);

      const reader = Deno.stdin.readable.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      write("> ");
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) { write("> "); continue; }

          if (line.startsWith("/")) {
            const result = handleCommand(line);
            if (result === "quit") return;
            if (result) { write("> "); continue; }
          }

          await handleMessage(line);
          write("> ");
        }
      }
    },
  };
}
