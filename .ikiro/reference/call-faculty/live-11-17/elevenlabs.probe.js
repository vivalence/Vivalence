// limit: 3000 chars · one live pass, cheap: flash speaks TEXT (16 chars); scribe hears a 16 kHz mono wav (argv[0], none = flash alone, e.g. `say` → `afconvert -d LEI16@16000 -c 1`)
import * as dotenv from "@std/dotenv";
import provider from "../../../../commons/hallucinators/elevenlabs/provider/index.js";

const TEXT = "Vado al mercato.";
const CHUNK = 3200;

const { SECRET_VIVA_ELEVENLABS_API_KEY: key } = await dotenv.load({ envPath: `${Deno.env.get("HOME")}/.viva/.env` });

const faculties = await provider({ secrets: { key } });
const speech = faculties.find((faculty) => faculty.type === "speech");
const verbatim = faculties.find((faculty) => faculty.type === "verbatim");

const guard = new AbortController();
const timer = setTimeout(() => guard.abort(), 20000);
const started = performance.now();

let audio = 0;
try {
  for await (const packet of speech.via.stream({ source: TEXT }, { signal: guard.signal })) {
    if (packet.event === "/audio/packet") audio += packet.audio.data.length;
    else console.log("speech", JSON.stringify(packet));
  }
  console.log("speech", { voice: speech.id, b64: audio });
} catch (fault) {
  console.log("speech FAULT", fault.message);
}

if (Deno.args.length === 0) Deno.exit(0);
const wav = await Deno.readFile(Deno.args[0]);
const at = wav.findIndex((_, index) => String.fromCharCode(...wav.subarray(index, index + 4)) === "data");
const pcm = Uint8Array.from([...wav.subarray(at + 8), ...new Uint8Array(32000)]);

async function* source() {
  for (let offset = 0; offset < pcm.length; offset += CHUNK) {
    const slice = pcm.subarray(offset, offset + CHUNK);
    yield { event: "/audio/packet", audio: { data: btoa(String.fromCharCode(...slice)), rate: 16000, codec: "pcm_16000" } };
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

try {
  for await (const packet of verbatim.via.stream({ source: source(), settings: { language: ["it"] } }, { signal: guard.signal })) {
    console.log("verbatim", JSON.stringify(packet));
  }
} catch (fault) {
  console.log("verbatim FAULT", fault.message);
}
clearTimeout(timer);
console.log("done", { ms: Math.round(performance.now() - started), aborted: guard.signal.aborted, seconds: pcm.length / 32000 });
