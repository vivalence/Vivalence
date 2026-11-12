import { atom } from "nanostores";
import paladin from "@vivalence/paladin";
import { belt, pcm, Queue } from "@vivalence/typology";

const RATE = 16000;

const JITTER_BUFFER_SAMPLES = 1600;

export class Speaker {
  $claimed = atom(false);
  $playing = atom(false);
  $error = atom(null);
  $played = atom(0);
  out = new Queue();
  player = {
    command: "ffplay",
    args: ["-loglevel", "error", "-nodisp", "-autoexit", "-f", "f32le", "-ar", String(RATE), "-ch_layout", "mono", "-i", "-"],
  };
  process = null;
  worklet = null;
  drainController = null;
  inflight = null;

  constructor(box) {
    this.box = box;
  }

  get claimed() { return this.$claimed.get(); }
  get playing() { return this.$playing.get(); }
  get error() { return this.$error.get(); }
  get played() { return this.$played.get(); }

  async claim() {
    if (this.$claimed.get()) return;
    if (this.inflight) return this.inflight;
    this.inflight = (paladin.is.browser ? acquire : spawn)(this);
    try {
      await this.inflight;
    } finally {
      this.inflight = null;
    }
  }

  release() {
    teardown(this, null);
  }

  play(packet) {
    this.out.enqueue(pcm.decode(packet.audio.data));
  }

  flush() {
    this.out.flush();
    this.worklet?.port.postMessage({ flush: true });
    this.$playing.set(false);
    this.$played.set(0);
  }
}

async function spawn(speaker) {
  try {
    speaker.drainController = new AbortController();
    speaker.process = new Deno.Command(speaker.player.command, {
      args: speaker.player.args,
      stdin: "piped",
      stdout: "null",
      stderr: "null",
      signal: speaker.drainController.signal,
    }).spawn();
    pipe(speaker, speaker.process.stdin.getWriter());
    speaker.$claimed.set(true);
    speaker.$error.set(null);
  } catch (err) {
    teardown(speaker, err);
    throw err;
  }
}

async function pipe(speaker, writer) {
  let played = 0;
  try {
    for await (const frame of speaker.out.drain(speaker.drainController.signal)) {
      speaker.$playing.set(true);
      await writer.write(new Uint8Array(frame.buffer, frame.byteOffset, frame.byteLength));
      played += frame.length;
      speaker.$played.set(played / RATE);
      if (speaker.out.depth === 0) speaker.$playing.set(false);
    }
  } catch (err) {
    teardown(speaker, err);
  }
}

async function acquire(speaker) {
  try {
    const driver = speaker.box.drivers.audio;
    const context = driver.acquire();
    if (context.state === "suspended") await context.resume();
    const worklet = new URL("./worklet.js", import.meta.url);
    await context.audioWorklet.addModule(worklet.href);
    speaker.worklet = new AudioWorkletNode(context, "speaker-pcm", {
      processorOptions: { jitter: JITTER_BUFFER_SAMPLES },
    });
    speaker.worklet.port.onmessage = (event) => {
      if (event.data?.playing !== undefined) speaker.$playing.set(event.data.playing);
      if (event.data?.played !== undefined) speaker.$played.set(event.data.played / context.sampleRate);
    };
    speaker.worklet.connect(context.destination);
    speaker.drainController = new AbortController();
    belt.atom.until(driver.$state, (state) => state === "closed", speaker.drainController.signal).then(
      () => teardown(speaker, new Error("audio context closed")),
      () => {},
    );
    drainLoop(speaker);
    speaker.$claimed.set(true);
    speaker.$error.set(null);
  } catch (err) {
    teardown(speaker, err);
    throw err;
  }
}

function teardown(speaker, err) {
  speaker.drainController?.abort();
  speaker.drainController = null;
  speaker.worklet?.disconnect();
  speaker.worklet = null;
  speaker.process = null;
  speaker.$played.set(0);
  speaker.out.flush();
  speaker.$playing.set(false);
  speaker.$claimed.set(false);
  if (err) speaker.$error.set(err.message ?? String(err));
}

async function drainLoop(speaker) {
  for await (const frame of speaker.out.drain(speaker.drainController.signal)) {
    if (!speaker.worklet) break;
    speaker.worklet.port.postMessage(frame, [frame.buffer]);
  }
}
