import { atom } from "nanostores";
import { Pipe } from "@vivalence/typology";
import workletURL from "./worklet.js?url";

const SPEAKING_THRESHOLD = 0.02;
const SPEAKING_RISE_MS = 100;
const SPEAKING_FALL_MS = 600;

export class Microphone {
  $claimed = atom(false);
  $permission = atom("prompt");
  $error = atom(null);
  $level = atom(0);
  $speaking = atom(false);
  $paused = atom(false);
  in = new Pipe();
  stream = null;
  source = null;
  worklet = null;
  analyser = null;
  raf = null;
  inflight = null;
  audioUnsubscribe = null;
  riseSince = 0;
  fallSince = 0;

  constructor(box) {
    this.box = box;
    hydratePermission(this);
  }

  get claimed() { return this.$claimed.get(); }
  get permission() { return this.$permission.get(); }
  get error() { return this.$error.get(); }
  get level() { return this.$level.get(); }
  get speaking() { return this.$speaking.get(); }
  get paused() { return this.$paused.get(); }

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

  pause() {
    if (!this.$claimed.get() || this.$paused.get()) return;
    this.source?.disconnect(this.worklet);
    this.$paused.set(true);
  }

  resume() {
    if (!this.$claimed.get() || !this.$paused.get()) return;
    this.source?.connect(this.worklet);
    this.$paused.set(false);
  }
}

async function acquire(microphone) {
  try {
    microphone.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of microphone.stream.getAudioTracks()) {
      track.onended = () => teardown(microphone, new Error("track ended"));
    }
    const driver = microphone.box.drivers.audio;
    const context = driver.acquire();
    if (context.state === "suspended") await context.resume();
    await context.audioWorklet.addModule(workletURL);
    microphone.source = context.createMediaStreamSource(microphone.stream);
    microphone.worklet = new AudioWorkletNode(context, "microphone-pcm");
    microphone.worklet.port.onmessage = (event) => {
      if (!microphone.$claimed.get()) return;
      microphone.in.send(event.data);
    };
    microphone.analyser = context.createAnalyser();
    microphone.analyser.fftSize = 256;
    microphone.source.connect(microphone.worklet);
    microphone.source.connect(microphone.analyser);
    microphone.audioUnsubscribe = driver.$state.subscribe((state) => {
      if (state === "closed" && microphone.$claimed.get()) {
        teardown(microphone, new Error("audio context closed"));
      }
    });
    pollLevel(microphone);
    microphone.$permission.set("granted");
    microphone.$claimed.set(true);
    microphone.$error.set(null);
  } catch (err) {
    teardown(microphone, err);
    throw err;
  }
}

function teardown(microphone, err) {
  if (microphone.raf) cancelAnimationFrame(microphone.raf);
  microphone.raf = null;
  microphone.audioUnsubscribe?.();
  microphone.audioUnsubscribe = null;
  microphone.worklet?.disconnect();
  microphone.worklet = null;
  microphone.analyser = null;
  microphone.source?.disconnect();
  microphone.source = null;
  microphone.stream?.getTracks().forEach((track) => track.stop());
  microphone.stream = null;
  microphone.$level.set(0);
  microphone.$speaking.set(false);
  microphone.$paused.set(false);
  microphone.riseSince = 0;
  microphone.fallSince = 0;
  microphone.$claimed.set(false);
  if (err) {
    if (err.name === "NotAllowedError") microphone.$permission.set("denied");
    microphone.$error.set(err.message ?? String(err));
  }
}

function pollLevel(microphone) {
  const buffer = new Uint8Array(microphone.analyser.frequencyBinCount);
  const tick = () => {
    if (!microphone.analyser) return;
    microphone.analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const sample = (buffer[i] - 128) / 128;
      sum += sample * sample;
    }
    const level = Math.sqrt(sum / buffer.length);
    microphone.$level.set(level);
    updateSpeaking(microphone, level);
    microphone.raf = requestAnimationFrame(tick);
  };
  microphone.raf = requestAnimationFrame(tick);
}

async function hydratePermission(microphone) {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    microphone.$permission.set(status.state);
    status.onchange = () => microphone.$permission.set(status.state);
  } catch {}
}

function updateSpeaking(microphone, level) {
  const now = performance.now();
  if (level > SPEAKING_THRESHOLD) {
    microphone.fallSince = 0;
    if (!microphone.$speaking.get()) {
      if (!microphone.riseSince) microphone.riseSince = now;
      if (now - microphone.riseSince > SPEAKING_RISE_MS) {
        microphone.$speaking.set(true);
      }
    }
  } else {
    microphone.riseSince = 0;
    if (microphone.$speaking.get()) {
      if (!microphone.fallSince) microphone.fallSince = now;
      if (now - microphone.fallSince > SPEAKING_FALL_MS) {
        microphone.$speaking.set(false);
      }
    }
  }
}
