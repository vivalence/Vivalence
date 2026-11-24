// limit: 1800 chars · the tty's recorder WITHOUT a microphone: ffmpeg's own sine stands in for the device, same output path as Q17A
const recorder = new Deno.Command("ffmpeg", {
  args: ["-f", "lavfi", "-i", "sine=frequency=440:duration=2", "-ar", "16000", "-ac", "1", "-f", "f32le", "-"],
  stdout: "piped",
  stderr: "null",
}).spawn();
let chunks = 0;
let bytes = 0;
let split = 0;
let carried = new Uint8Array(0);
let samples = 0;
let peak = 0;
for await (const chunk of recorder.stdout) {
  chunks += 1;
  bytes += chunk.byteLength;
  if (chunk.byteLength % 4 !== 0) split += 1;
  const joined = new Uint8Array(carried.byteLength + chunk.byteLength);
  joined.set(carried);
  joined.set(chunk, carried.byteLength);
  const whole = joined.byteLength - (joined.byteLength % 4);
  const frame = new Float32Array(joined.buffer.slice(0, whole));
  carried = joined.slice(whole);
  samples += frame.length;
  for (const sample of frame) peak = Math.max(peak, Math.abs(sample));
}
console.log(JSON.stringify({ chunks, bytes, split, samples, seconds: samples / 16000, peak: Number(peak.toFixed(3)), left: carried.byteLength }, null, 2));
