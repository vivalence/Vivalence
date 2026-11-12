import { native } from "./recorder.s14.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const unhandled = [];
globalThis.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  unhandled.push(`${event.reason.name}: ${event.reason.message}`);
});
const sine = (rate) => ({
  command: "ffmpeg",
  args: ["-loglevel", "error", "-re", "-f", "lavfi", "-i", "sine=frequency=441:duration=30", "-ar", String(rate), "-ac", "1", "-f", "f32le", "-"],
  rate,
});
const CASES = {
  "sine at 16000": sine(16000),
  "sine at 8000": sine(8000),
  "exits 1 at once": { command: "ffmpeg", args: ["-loglevel", "error", "-f", "lavfi", "-i", "nope=1", "-f", "f32le", "-"], rate: 16000 },
  "no such command": { command: "recorder-absent", args: [], rate: 16000 },
};

for (const form of (Deno.args.length ? Deno.args : ["tty", "s14"])) {
  const { Microphone } = await import(`./microphone.${form}.js`);
  for (const [name, recorder] of Object.entries(CASES)) {
    unhandled.length = 0;
    const microphone = new Microphone({ drivers: { audio: { context: null } } });
    microphone.recorder = recorder;
    let claim = "resolved";
    try {
      await microphone.claim();
    } catch (error) {
      claim = `REJECTS ${error.name}: ${error.message}`;
    }
    const seen = [];
    let ended = false;
    const drained = microphone.feed === null
      ? Promise.resolve()
      : (async () => {
          for await (const packet of microphone.frames()) seen.push(packet);
          ended = true;
        })().catch((error) => seen.push({ fault: error.message }));
    await sleep(700);
    const held = { claim, packets: seen.length, rate: seen[0]?.rate ?? null, seconds: seen.length ? Number((seen.at(-1).pts + (atob(seen.at(-1).audio).length / 4) / seen.at(-1).rate).toFixed(2)) : 0, framesEnded: ended, claimed: microphone.claimed, error: microphone.error, unhandled: [...unhandled] };
    microphone.release("stop");
    await drained;
    await sleep(150);
    console.log(`--- ${form} · ${name}\n${JSON.stringify(held, null, 2)}`);
  }
}
console.log("--- native(\"darwin\")\n" + JSON.stringify(native("darwin"), null, 2));
for (const os of ["linux", "windows"]) {
  try { native(os); } catch (error) { console.log(`--- native("${os}")\n${error.message}`); }
}
