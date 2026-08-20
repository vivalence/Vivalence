export function encode(samples) {
  const ints = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    ints[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  const view = new Uint8Array(ints.buffer);
  let binary = "";
  for (let i = 0; i < view.length; i += 0x8000)
    binary += String.fromCharCode(...view.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function bytes(audio) {
  if (audio instanceof Uint8Array) return audio;
  return Uint8Array.from(atob(audio), (character) => character.charCodeAt(0));
}

export function decode(audio) {
  const raw = bytes(audio);
  const ints = new Int16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2));
  const samples = new Float32Array(ints.length);
  for (let i = 0; i < ints.length; i++) {
    samples[i] = ints[i] < 0 ? ints[i] / 0x8000 : ints[i] / 0x7fff;
  }
  return samples;
}
