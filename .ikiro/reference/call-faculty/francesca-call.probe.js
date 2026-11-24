// limit: 6000 chars · Francesca's call, live: a throwaway ledger on a free port, the education package copied without its topographies,
// elevenlabs hears and speaks, the ledger's fast mind answers; argv[0] a 16 kHz mono wav. Nothing under ~/.viva is written.
import * as dotenv from "@std/dotenv";
import { join } from "@std/path";
import { Connection, shape, shard, sleep, Url } from "@vivalence/typology";
import { READY } from "../../../systems/runtime/tests/scenarios/hello.js";
import { RECIPE, boot, copy, ledger, pin, viva } from "../../../systems/runtime/tests/qa/rig.js";

const CHUNK = 3200;
const HOME = Deno.env.get("HOME");
const [clip, harnessed] = Deno.args;
const KEYS = ["SECRET_VIVA_ELEVENLABS_API_KEY", "SECRET_VIVA_OPENROUTER_API_KEY", "SECRET_VIVA_ANTHROPIC_API_KEY"];
const held = await dotenv.load({ envPath: `${HOME}/.viva/.env` });
const secrets = Object.fromEntries(KEYS.map((key) => [key, held[key]]));
const live = JSON.parse(await Deno.readTextFile(`${HOME}/.viva/ledger.viva.json`));

const ITALIAN = {
  manifest: { type: "daemon", slug: "italian", version: "0.0.1" },
  statics: { language: { known: { slug: "english", name: "English" }, learning: { slug: "italian", name: "Italiano" } } },
  modes: [
    "@education/domain/language-learning",
    "@education/topology/word",
    "@education/topology/sentence",
    "@education/topology/conjugation",
    "@education/teacher/francesca",
  ],
};

const world = await ledger("viva-francesca-call-");
let runtime;
let transport;
try {
  await copy(join(HOME, ".viva/registry/education"), join(world.root, "registry/education"), {
    skip: ["topographies", "bak", "freight", "node_modules", "instances"],
  });
  await viva(world, ["ledger/install"]);
  const tapped = await viva(world, ["registry/tap", join(world.root, "registry/education")]);
  if (!tapped.effect?.root) throw new Error(`registry/tap failed: ${tapped.out.slice(-800)} ${tapped.err.slice(-800)}`);

  const recipe = RECIPE("francesca", [ITALIAN], { hallucinators: live.hallucinators });
  recipe.telemetry = { logger: { console: { "/runtime/(.*)": ["status", "fault", "log"] }, "all.jsonl": { "/(.*)": ["start", "stop", "request", "response", "fault", "log", "entity", "status", "usage"] } } };
  for (const key of KEYS) recipe.environment.properties[key] = { type: "string", group: "keys" };
  await Deno.mkdir(join(world.root, "recipe"));
  await Deno.writeTextFile(join(world.root, "recipe/instance.viva.json"), JSON.stringify(recipe, null, 2));
  const cloned = await viva(world, ["instance/clone", join(world.root, "recipe"), "--slug=francesca", "--use", "--install"]);
  if (!cloned.effect?.target) throw new Error(`instance/clone failed: ${cloned.out.slice(-1500)} ${cloned.err.slice(-1500)}`);
  const shelf = cloned.effect.target;
  await pin(shelf, { VIVA_RUNTIME_ORIGIN: world.origin });

  runtime = await boot(world, { shelf, slug: "francesca", extra: secrets, deadline: 180_000 });
  if (!READY.test(runtime.ready ?? "")) throw new Error(`no boot:\n${runtime.tail()}`);
  console.log("booted", world.origin);

  const signup = await runtime.call("/lighthouse/signup", { username: "finn", password: "hunter22" });
  const access = signup.authority.access;
  const modes = await runtime.call("/daemon/italian/entities/mode/find", { where: {} }, access);
  const francesca = modes.find((mode) => mode.slug === "francesca");
  console.log("modes", modes.map((mode) => `${mode.type}/${mode.slug}`).join(" "));
  console.log("francesca traits", JSON.stringify(francesca.traits));

  const thread = await runtime.call(
    "/userspace/entities/thread/create",
    { data: { user: signup.user.id, mode: francesca.id, ...(harnessed ? { traits: ["HARNESSED"], trait: { HARNESSED: JSON.parse(harnessed) } } : { trait: {} }) } },
    access,
  );
  console.log("thread traits", JSON.stringify(thread.traits), JSON.stringify(thread.trait));

  transport = shard.transmitter.multiplex({ authority: { get: () => ({ access }) } });
  const connection = new Connection(new Url(world.origin), transport).use(
    shard.connection.authorize({ get: () => ({ access }) }),
  );
  const mode = connection.branch("/daemon/italian/mode/teacher/francesca");
  const metadata = await mode.call("/metadata/harness");
  const harness = shape.connection.wire(mode.branch("/harness"), metadata.references);
  console.log("harness routes", Object.keys(harness).join(" "));
  if (!harness.call) throw new Error("no /call on francesca's harness");

  const wav = await Deno.readFile(clip);
  const at = wav.findIndex((_, index) => String.fromCharCode(...wav.subarray(index, index + 4)) === "data");
  const pcm = Uint8Array.from([...wav.subarray(at + 8), ...new Uint8Array(640000)]);

  async function* microphone() {
    for (let offset = 0; offset < pcm.length; offset += CHUNK) {
      const slice = pcm.subarray(offset, offset + CHUNK);
      yield {
        event: "/audio/packet",
        audio: { data: btoa(String.fromCharCode(...slice)), rate: 16000, codec: "pcm_16000" },
      };
      await sleep.ms(100);
    }
  }

  const guard = new AbortController();
  const timer = setTimeout(() => guard.abort(), 60000);
  const started = performance.now();
  const audio = { packets: 0, first: null, last: null };
  try {
    for await (const packet of harness.call.stream(microphone(), { input: { thread: thread.id }, signal: guard.signal })) {
      const ms = Math.round(performance.now() - started);
      if (packet.event === "/audio/packet") {
        audio.packets += 1;
        audio.first ??= ms;
        audio.last = ms;
      } else if (packet.event !== "/part/delta" && packet.event !== "/part/draft") console.log(ms, JSON.stringify(packet).slice(0, 600));
    }
  } catch (fault) {
    console.log("FAULT", fault.message);
  }
  clearTimeout(timer);
  console.log("audio", JSON.stringify(audio), "aborted", guard.signal.aborted);

  await sleep.ms(3000);
  const stored = await runtime.call("/userspace/entities/turn/find", { where: { thread: thread.id } }, access);
  for (const turn of stored) console.log("stored", turn.role, JSON.stringify(turn.parts).slice(0, 400), JSON.stringify(turn.meta?.state));
  const rows = (await Deno.readTextFile(join(world.root, "ledger/logs/francesca/all.jsonl"))).trim().split("\n").map((row) => JSON.parse(row));
  const census = {};
  for (const row of rows) census[`${row.track.padEnd(8)} ${String(row.path).replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, ":id")}`] = (census[`${row.track.padEnd(8)} ${String(row.path).replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, ":id")}`] ?? 0) + 1;
  console.log("records", rows.length);
  for (const [key, count] of Object.entries(census)) console.log(String(count).padStart(4), key);
  console.log("faults in the runtime's log:");
  console.log(runtime.log.filter((line) => /fault|error/i.test(line)).slice(-15).join("\n"));
} finally {
  transport?.close();
  await sleep.ms(200);
  await runtime?.stop("SIGKILL");
  await world.remove();
}
