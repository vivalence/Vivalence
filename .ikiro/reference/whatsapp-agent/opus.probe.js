import { OggOpusDecoder } from "npm:ogg-opus-decoder@1.6.14";

const bytes = await Deno.readFile(Deno.args[0]);
const decoder = new OggOpusDecoder({ sampleRate: 16000, forceStereo: false });
await decoder.ready;
const started = performance.now();
const { channelData, samplesDecoded, sampleRate } = await decoder.decodeFile(bytes);
const pcm = Int16Array.from(channelData[0], (sample) => Math.max(-1, Math.min(1, sample)) * 32767);
console.log(JSON.stringify({ in: bytes.length, sampleRate, samplesDecoded, channels: channelData.length, pcmBytes: pcm.byteLength, ms: Math.round(performance.now() - started) }));
decoder.free();
