const FRAME_SAMPLES = 1024;

class MicrophonePcmProcessor extends AudioWorkletProcessor {
  pending = [];
  pendingSamples = 0;

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    this.pending.push(new Float32Array(channel));
    this.pendingSamples += channel.length;
    if (this.pendingSamples < FRAME_SAMPLES) return true;
    const frame = new Float32Array(this.pendingSamples);
    let offset = 0;
    for (const slice of this.pending) {
      frame.set(slice, offset);
      offset += slice.length;
    }
    this.pending = [];
    this.pendingSamples = 0;
    this.port.postMessage(frame, [frame.buffer]);
    return true;
  }
}

registerProcessor("microphone-pcm", MicrophonePcmProcessor);
