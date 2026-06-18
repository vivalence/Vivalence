import { atom } from "nanostores";
import { Queue } from "@vivalence/typology";
import workletURL from "./worklet.js?url";

const JITTER_BUFFER_SAMPLES = 1600; // 100ms at 16kHz

export class Speaker {
  $claimed = atom(false);
  $playing = atom(false);
  $error = atom(null);
  out = new Queue();
  worklet = null;
  drainController = null;
  inflight = null;
  audioUnsubscribe = null;

  constructor(box) {
    this.box = box;
  }

  get claimed() { return this.$claimed.get(); }
  get playing() { return this.$playing.get(); }
  get error() { return this.$error.get(); }

  async claim() {
    if (this.$claimed.get()) return;
    if (this.inflight) return this.inflight;
    this.inflight = acquire(this);
    try {
      await this.inflight;
    } finally {
      this.inflight = null;
    }
  }

  release() {
    teardown(this, null);
  }

  flush() {
    this.out.flush();
    this.worklet?.port.postMessage({ flush: true });
    this.$playing.set(false);
  }
}

async function acquire(speaker) {
  try {
    const driver = speaker.box.drivers.audio;
    const context = driver.acquire();
    if (context.state === "suspended") await context.resume();
    await context.audioWorklet.addModule(workletURL);
    speaker.worklet = new AudioWorkletNode(context, "speaker-pcm", {
      processorOptions: { jitter: JITTER_BUFFER_SAMPLES },
    });
    speaker.worklet.port.onmessage = (event) => {
      if (event.data?.playing !== undefined) speaker.$playing.set(event.data.playing);
    };
    speaker.worklet.connect(context.destination);
    speaker.drainController = new AbortController();
    speaker.audioUnsubscribe = driver.$state.subscribe((state) => {
      if (state === "closed" && speaker.$claimed.get()) {
        teardown(speaker, new Error("audio context closed"));
      }
    });
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
  speaker.audioUnsubscribe?.();
  speaker.audioUnsubscribe = null;
  speaker.worklet?.disconnect();
  speaker.worklet = null;
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
