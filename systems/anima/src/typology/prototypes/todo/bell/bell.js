import { atom } from "nanostores";
import { Pipe, Queue } from "@vivalence/typology";

class Bell {
  mic = new Pipe();
  speaker = new Queue();
  vad = { $speaking: atom(false) };

  $state = atom("IDLE");
  $permission = atom("prompt");
  $devices = atom({ inputs: [], outputs: [], selected: null });
  $inputLevel = atom(0);
  $outputLevel = atom(0);

  #owner = null;
  #context = null;
  #recorder = null;
  #source = null;
  #meter = null;

  claim(owner) {
    if (this.#owner && this.#owner !== owner) return false;
    this.#owner = owner;
    return true;
  }

  release(owner) {
    if (this.#owner !== owner) return;
    this.micStop();
    this.speakerStop();
    this.#owner = null;
    this.$state.set("IDLE");
  }

  async prime() {
    if (this.#context) return;
    if (typeof AudioContext === "undefined") {
      throw new Error("BELL: AudioContext unavailable (server-side)");
    }
    this.#context = new AudioContext({ sampleRate: 8000 });
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.$devices.set({
        inputs: devices.filter((device) => device.kind === "audioinput"),
        outputs: devices.filter((device) => device.kind === "audiooutput"),
        selected: null,
      });
    } catch {}
  }

  async micStart() {
    await this.prime();
    this.$state.set("PRIMING");
    const source = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.#source = source;
    this.$permission.set("granted");
    this.#recorder = new MediaRecorder(source, { mimeType: "audio/webm;codecs=opus" });
    this.#recorder.ondataavailable = async (event) => {
      if (!event.data || event.data.size === 0) return;
      const buffer = await event.data.arrayBuffer();
      this.mic.send(new Uint8Array(buffer));
    };
    this.#recorder.start(20);
    this.#wireLevelMeter(source);
    this.$state.set("CAPTURING");
  }

  micStop() {
    if (this.#recorder) {
      try {
        this.#recorder.stop();
      } catch {}
      this.#recorder = null;
    }
    if (this.#source) {
      for (const track of this.#source.getTracks()) track.stop();
      this.#source = null;
    }
    if (this.#meter) {
      cancelAnimationFrame(this.#meter);
      this.#meter = null;
    }
    this.$inputLevel.set(0);
    this.vad.$speaking.set(false);
    if (this.$state.get() !== "MUTED") this.$state.set("IDLE");
  }

  micMute() {
    this.$state.set("MUTED");
  }
  micUnmute() {
    this.$state.set(this.#recorder ? "CAPTURING" : "IDLE");
  }

  speakerStop() {
    this.speaker.flush();
    this.$outputLevel.set(0);
  }

  #wireLevelMeter(source) {
    const node = this.#context.createMediaStreamSource(source);
    const analyser = this.#context.createAnalyser();
    analyser.fftSize = 256;
    node.connect(analyser);
    const window = new Uint8Array(analyser.frequencyBinCount);
    const sample = () => {
      if (this.$state.get() === "IDLE") {
        this.#meter = null;
        return;
      }
      analyser.getByteTimeDomainData(window);
      let sum = 0;
      for (let i = 0; i < window.length; i++) {
        const value = (window[i] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / window.length);
      this.$inputLevel.set(rms);
      this.vad.$speaking.set(rms > 0.03);
      this.#meter = requestAnimationFrame(sample);
    };
    this.#meter = requestAnimationFrame(sample);
  }
}

export const bell = new Bell();
