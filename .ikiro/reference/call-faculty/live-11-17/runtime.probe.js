// limit: 3500 chars · C3 · C4 live: the mode's harness over a socket on a free port; elevenlabs hears and speaks, the stub mind answers (no anthropic); argv[0] a 16 kHz mono wav, argv[1] "verbatim" | "call"
import * as dotenv from "@std/dotenv";
import { shape, shard, sleep, Url, Connection } from "@vivalence/typology";
import provider from "../../../../commons/hallucinators/elevenlabs/provider/index.js";
import { create } from "../../../../systems/runtime/tests/scenarios/cortex.js";

const CHUNK = 3200;
const [clip, route] = Deno.args;

const { SECRET_VIVA_ELEVENLABS_API_KEY: key } = await dotenv.load({ envPath: `${Deno.env.get("HOME")}/.viva/.env` });
const scenario = await create({ faculties: await provider({ secrets: { key } }) });

const aperture = scenario.daemon.aperture;
aperture.open("/multiplex", shard.serve.multiplex(aperture));
const abort = new AbortController();
const server = Deno.serve({ port: 0, signal: abort.signal, onListen() {} }, shape.http(aperture));
const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
const connection = new Connection(new Url(`http://localhost:${server.addr.port}`), transport);
const harness = shape.connection.wire(
  connection.branch(scenario.dewey.reference.absolute).branch("/harness"),
  shape.strip(scenario.dewey.aperture.branch("/harness")),
);
console.log("port", server.addr.port, "routes", Object.keys(harness));

const thread = await scenario.createThread();
thread.traits = ["CONVERSATIONAL"];
thread.trait = { CONVERSATIONAL: { language: ["it"] } };
await scenario.em.flush();

const wav = await Deno.readFile(clip);
const at = wav.findIndex((_, index) => String.fromCharCode(...wav.subarray(index, index + 4)) === "data");
const pcm = Uint8Array.from([...wav.subarray(at + 8), ...new Uint8Array(route === "call" ? 192000 : 32000)]);

async function* microphone() {
  for (let offset = 0; offset < pcm.length; offset += CHUNK) {
    const slice = pcm.subarray(offset, offset + CHUNK);
    yield { event: "/audio/packet", audio: { data: btoa(String.fromCharCode(...slice)), rate: 16000, codec: "pcm_16000" } };
    await sleep.ms(100);
  }
}

const guard = new AbortController();
const timer = setTimeout(() => guard.abort(), 25000);
const started = performance.now();
let audio = 0;
try {
  for await (const packet of harness[route].stream(microphone(), { input: { thread: thread.id }, signal: guard.signal })) {
    if (packet.event === "/audio/packet") audio += 1;
    else console.log(Math.round(performance.now() - started), JSON.stringify(packet));
  }
} catch (fault) {
  console.log("FAULT", fault.message);
}
clearTimeout(timer);

scenario.em.clear();
const stored = await scenario.entities.turn.history({ thread: thread.id });
console.log("audio packets", audio);
console.log("stored", JSON.stringify(stored.map((turn) => ({ role: turn.role, parts: turn.parts }))));
console.log("done", { ms: Math.round(performance.now() - started), aborted: guard.signal.aborted, seconds: pcm.length / 32000 });

transport.close();
await sleep.ms(200);
abort.abort();
await scenario.orm.close();
