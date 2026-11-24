import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { Queue, sleep } from "@vivalence/typology";
import * as hello from "../../../systems/runtime/tests/scenarios/hello.js";
import { boot } from "./social/personal/boot.js";

const MODE = new URL("./social/personal/personal.viva.js", import.meta.url).pathname;
const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";

// unit: a fake provider over a Queue
{
  const inbox = new Queue();
  const logged = [];
  const faults = [];
  const stdout = { log: (m) => { if (m.id === "boom") throw new Error("received broke"); logged.push(m.id); }, fault: (e) => faults.push(e.message) };
  let ended = 0;
  const provider = { async *messages(signal) { try { for await (const p of inbox.drain(signal)) { if (p.id === "bad") throw new Error("heard broke"); yield p; } } finally { ended++; } } };
  const modeDie = { mode: { stdout }, providers: { whatsapp: provider } };
  const teardown = boot(modeDie, { statics: { platforms: ["whatsapp"] } });
  inbox.enqueue({ id: "a" }); inbox.enqueue({ id: "bad" }); inbox.enqueue({ id: "b" }); inbox.enqueue({ id: "boom" }); inbox.enqueue({ id: "c" });
  await sleep.ms(50);
  console.log("unit logged", logged, "faults", faults, "generators ended", ended);
  const t = Date.now();
  await teardown();
  console.log("unit teardown resolved in ms", Date.now() - t, "ended", ended);
  inbox.enqueue({ id: "late" }); await sleep.ms(30);
  console.log("unit after release logged", logged, "depth", inbox.depth);
  try { boot(modeDie, { statics: { platforms: ["telegram"] } }); console.log("missing provider: NO THROW"); } catch (e) { console.log("missing provider throws:", e.message); }
}

const SECRETS = { SECRET_VIVA_WHATSAPP_APP: "app-secret", SECRET_VIVA_WHATSAPP_VERIFY: "verify-token", SECRET_VIVA_WHATSAPP_TOKEN: "graph-token" };
const doc = (description) => ({ type: "string", description });
const recipe = {
  ...hello.RECIPE,
  services: [{ manifest: { type: "service", slug: "whatsapp" }, module: "@commons/service/whatsapp", secrets: { app: "${SECRET_VIVA_WHATSAPP_APP}", verify: "${SECRET_VIVA_WHATSAPP_VERIFY}" } }],
  daemons: [{
    manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
    modes: [Deno.env.get("PLATFORMS") ? { module: MODE, statics: { platforms: Deno.env.get("PLATFORMS").split(",") } } : MODE],
    consume: { whatsapp: { module: "@commons/service/whatsapp", statics: { graph: "http://localhost:1", number: "2", owner: OWNER }, secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" } } },
  }],
  environment: { ...hello.RECIPE.environment, properties: { ...hello.RECIPE.environment.properties, SECRET_VIVA_WHATSAPP_APP: doc("a"), SECRET_VIVA_WHATSAPP_VERIFY: doc("b"), SECRET_VIVA_WHATSAPP_TOKEN: doc("c") } },
};

let world;
try {
  world = await hello.launch({ prefix: "viva-pull-", ledger: hello.LEDGER, environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }), home: (home) => Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe, null, 2)) });
} catch (e) { console.log("BOOT FAILED:", e.message.split("\n").slice(0, 12).join("\n")); Deno.exit(0); }

const sign = async (body) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("app-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return `sha256=${encodeHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))}`;
};
const post = async (value) => {
  const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value }] }] });
  const r = await fetch(`${world.origin}${HOOK}`, { method: "POST", headers: { "content-type": "application/json", "x-hub-signature-256": await sign(body) }, body });
  await r.body?.cancel();
  return r.status;
};
const text = (id) => ({ messaging_product: "whatsapp", contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }], messages: [{ from: OWNER, timestamp: "1732440000", id, type: "text", text: { body: "hi " + id } }] });
const mark = world.log.length;
console.log("post A", await post(text("wamid.A")));
const broken = text("wamid.BAD"); delete broken.contacts;
console.log("post BAD (no contacts)", await post(broken));
console.log("post B", await post(text("wamid.B")));
await sleep.ms(600);
console.log("alive after fault:", (await world.get("/beacon/status")).status);
console.log("--- runtime log since posts");
for (const line of world.log.slice(mark)) console.log("  " + line.slice(0, 260));
world.child.kill("SIGTERM");
const exit = await Promise.race([world.child.status, sleep.ms(8000).then(() => "STILL RUNNING after 8s")]);
console.log("SIGTERM exit:", JSON.stringify(exit));
console.log("--- tail"); for (const line of world.log.slice(-6)) console.log("  " + line.slice(0, 200));
await world.stop().catch((e) => console.log("stop:", e.message));
