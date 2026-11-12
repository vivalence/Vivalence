import { atom } from "nanostores";
import { v } from "@vivalence/typology";

const { Audio } = v.primitives.hallucination;
const tracks = [];
globalThis.navigator ??= {};
Object.defineProperty(globalThis, "navigator", { value: { mediaDevices: { getUserMedia: async () => ({ getAudioTracks: () => tracks, getTracks: () => tracks }) } }, configurable: true });
globalThis.AudioWorkletNode = class { port = {}; disconnect() {} };
globalThis.requestAnimationFrame = () => 1;
globalThis.cancelAnimationFrame = () => {};
const context = {
  state: "running",
  sampleRate: 16000,
  audioWorklet: { addModule: async () => {} },
  createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
  createAnalyser: () => ({ fftSize: 0, frequencyBinCount: 4, getByteTimeDomainData() {} }),
};
const box = { drivers: { audio: { context, acquire: () => context, $state: atom("running") } } };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tone = (value) => new Float32Array(8).fill(value);

const dictation = async (Microphone, label, end, { late = false } = {}) => {
  tracks.length = 0;
  tracks.push({ stop() {} });
  const microphone = new Microphone(box);
  await microphone.claim();
  const feed = microphone.feed.signal;
  const frames = microphone.frames();
  const seen = [];
  let fault = null;
  if (late) end(microphone);
  const drained = (async () => {
    try {
      for await (const packet of frames) seen.push(packet);
    } catch (error) {
      fault = `${error.name}: ${error.message}`;
    }
  })();
  if (!late) {
    await sleep(1);
    microphone.worklet.port.onmessage({ data: tone(0.25) });
    microphone.worklet.port.onmessage({ data: tone(-0.25) });
    await sleep(1);
    end(microphone);
  }
  await drained;
  const reason = feed.reason instanceof Error ? `${feed.reason.name}` : feed.reason;
  console.log(`--- ${label}`);
  for (const packet of seen) console.log(JSON.stringify(packet, null, 2), [...Audio.Packet.errors(packet)].length ? "INVALID" : "valid");
  console.log(JSON.stringify({ packets: seen.length, fault, reason, claimed: microphone.claimed, feed: microphone.feed, taps: microphone.in.listeners.size }));
};

for (const name of ["locked", "fixed"]) {
  const { Microphone } = await import(`./microphone.${name}.js`);
  await dictation(Microphone, `${name}: two frames, then release("send")`, (microphone) => microphone.release("send"));
  await dictation(Microphone, `${name}: released before the first pull`, (microphone) => microphone.release("trash"), { late: true });
  await dictation(Microphone, `${name}: the track ends on its own`, () => tracks[0].onended());
}
