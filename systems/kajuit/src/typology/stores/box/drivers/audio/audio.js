import { atom } from "nanostores";

export class AudioDriver {
  $state = atom("idle");
  context = null;

  acquire() {
    if (!this.context || this.context.state === "closed") {
      this.context = new AudioContext({ sampleRate: 16000 });
      if (this.context.sampleRate !== 16000) {
        console.warn(
          `[box.drivers.audio] sampleRate=${this.context.sampleRate}, expected 16000`,
        );
      }
      this.context.onstatechange = () => this.$state.set(this.context.state);
    }
    this.$state.set(this.context.state);
    return this.context;
  }

  async release() {
    await this.context?.close();
    this.context = null;
    this.$state.set("idle");
  }
}
