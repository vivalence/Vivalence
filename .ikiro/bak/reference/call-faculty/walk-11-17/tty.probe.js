import { v } from "@vivalence/typology";

const { Audio } = v.primitives.hallucination;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const running = async () => new TextDecoder().decode((await new Deno.Command("pgrep", { args: ["-f", "sine=frequency=441"], stdout: "piped" }).output()).stdout).trim().split("\n").filter(Boolean).length;

const SINE = { command: "ffmpeg", args: ["-re", "-f", "lavfi", "-i", "sine=frequency=441:duration=30", "-ar", "16000", "-ac", "1", "-f", "f32le", "-"] };

for (const name of ["tty.locked", "tty"]) {
  const { Microphone } = await import(`./microphone.${name}.js`);
  const microphone = new Microphone({ drivers: { audio: { context: null } } });
  if (name === "tty") console.log("--- the microphone holds\n" + JSON.stringify(microphone.recorder, null, 2));
  microphone.recorder = SINE;
  await microphone.claim();
  const feed = microphone.feed.signal;
  const seen = [];
  let fault = null;
  const drained = (async () => {
    try {
      for await (const packet of microphone.frames()) seen.push(packet);
    } catch (error) {
      fault = `${error.name}: ${error.message}`;
    }
  })();
  await sleep(600);
  const alive = await running();
  microphone.release("stop");
  await drained;
  await sleep(200);
  console.log(`--- ${name}: a sine stands in for the device, 600 ms, then release("stop")`);
  if (seen.length) console.log(JSON.stringify({ ...seen[0], audio: `${seen[0].audio.length} chars` }), [...Audio.Packet.errors(seen[0])].length ? "INVALID" : "valid");
  console.log(JSON.stringify({ packets: seen.length, seconds: seen.length ? Number((seen.at(-1).pts + 0).toFixed(3)) : 0, fault, reason: feed.reason, claimed: microphone.claimed, recorderAlive: alive, recorderAfter: await running() }));
}
