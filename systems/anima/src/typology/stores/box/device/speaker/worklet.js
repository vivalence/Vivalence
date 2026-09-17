class SpeakerPcmProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.queue = [];
    this.cursor = 0;
    this.playing = false;
    this.bufferedSamples = 0;
    this.priming = true;
    this.jitter = options?.processorOptions?.jitter ?? 1600;
    this.port.onmessage = (event) => {
      if (event.data?.flush) {
        this.queue.length = 0;
        this.cursor = 0;
        this.bufferedSamples = 0;
        this.priming = true;
        return;
      }
      this.queue.push(event.data);
      this.bufferedSamples += event.data.length;
    };
  }

  process(_inputs, outputs) {
    const channel = outputs[0][0];
    if (this.priming) {
      if (this.bufferedSamples < this.jitter) {
        for (let i = 0; i < channel.length; i++) channel[i] = 0;
        return true;
      }
      this.priming = false;
    }
    let written = 0;
    while (written < channel.length && this.queue.length > 0) {
      const head = this.queue[0];
      const remaining = head.length - this.cursor;
      const take = Math.min(remaining, channel.length - written);
      channel.set(head.subarray(this.cursor, this.cursor + take), written);
      written += take;
      this.cursor += take;
      this.bufferedSamples -= take;
      if (this.cursor >= head.length) {
        this.queue.shift();
        this.cursor = 0;
      }
    }
    while (written < channel.length) channel[written++] = 0;
    const playing = this.queue.length > 0;
    if (playing !== this.playing) {
      this.playing = playing;
      this.port.postMessage({ playing });
    }
    return true;
  }
}

registerProcessor("speaker-pcm", SpeakerPcmProcessor);
