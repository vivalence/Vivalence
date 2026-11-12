import { Queue, Vector, soma } from "@vivalence/typology";

const HUSHED = { turns: [], open: null };

const VOICES = [
  [(packet, call) => packet.event === "/turn/close" && call.turns.at(-1).role === "user", "thinking"],
  [(packet) => packet.event === "/audio/packet", "speaking"],
  [(packet) => packet.event === "/turn/close", "listening"],
  [(packet) => packet.event === "/turn/open" && packet.turn.role === "user", "listening"],
];

const voiced = (state, packet, call) => {
  const found = VOICES.find(([matches]) => matches(packet, call));
  return found === undefined ? state : found[1];
};

const TOUCHED = [
  [(packet) => packet.event === "/part/full" && packet.turn !== undefined, (call, packet) => call.turns.find((turn) => turn.id === packet.turn)],
  [(packet) => packet.event === "/turn/close" || packet.event === "/turn/full", (call) => call.turns.at(-1)],
  [(packet) => packet.event.startsWith("/audio/"), () => undefined],
  [() => true, (call) => call.open],
];

const touched = (call, packet) => TOUCHED.find(([matches]) => matches(packet))[1](call, packet);

const interrupted = (packet) => packet.event === "/turn/close" && packet.turn.meta?.state === "interrupted";

function played(speaker, signal) {
  const heard = new Queue();
  const off = speaker.$played.listen((pts) => heard.enqueue({ event: "/audio/played", pts }));
  signal.addEventListener("abort", () => (off(), heard.close()), { once: true });
  return heard.drain();
}

export const call = new Vector()
  .open(
    {
      nature: "/call",
      rank: "hidden",
      valence: "a call starts: you speak, the mode answers aloud; speak over it and it stops. Example: /call",
      chord: "leader/c/l",
    },
    async (ctx) => {
      const { microphone, speaker } = ctx.client.app.box.device;
      await speaker.claim();
      await microphone.claim();
      const feed = microphone.feed.signal;
      let folded = HUSHED;
      let voice = { state: "listening", since: Date.now(), heard: {} };
      ctx.client.app.bridge.$call.set(voice);
      try {
        const source = soma.merge(microphone.frames(), played(speaker, feed));
        const heard = ctx.terminal.mode.harness.call.stream(source, { input: { thread: ctx.terminal.thread.id } });
        for await (const packet of heard) {
          if (packet.event === "/audio/packet") speaker.play(packet);
          if (packet.event === "/turn/open" && packet.turn.role === "user" && speaker.playing) speaker.flush();
          if (interrupted(packet)) voice = { ...voice, heard: { ...voice.heard, [folded.open.id]: speaker.played } };
          if (interrupted(packet)) speaker.flush();
          folded = soma.transcript(folded, packet);
          voice = { ...voice, state: voiced(voice.state, packet, folded) };
          ctx.client.app.bridge.$call.set(voice);
          const turn = touched(folded, packet);
          if (turn !== undefined && turn !== null)
            await ctx.client.runtime.entities.turn.merge({ ...turn, thread: ctx.terminal.thread.id, mode: ctx.terminal.mode.id });
        }
      } finally {
        microphone.release("end");
        speaker.release();
        ctx.client.app.bridge.$call.set(null);
      }
    },
  )
  .open(
    { nature: "/call/end", rank: "hidden", valence: "the call ends; what was said stays in the thread. Example: /call/end" },
    (ctx) => ctx.client.app.box.device.microphone.release("end"),
  );
