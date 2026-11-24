import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { sleep } from "@vivalence/typology";
import * as hello from "../../../systems/runtime/tests/scenarios/hello.js";

const MODE = new URL("./step4/personal/personal.viva.js", import.meta.url).pathname;
const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const SECRETS = { SECRET_VIVA_WHATSAPP_APP: "app-secret", SECRET_VIVA_WHATSAPP_VERIFY: "verify-token", SECRET_VIVA_WHATSAPP_TOKEN: "graph-token" };
const doc = (description) => ({ type: "string", description });
const recipe = {
  ...hello.RECIPE,
  services: [{ manifest: { type: "service", slug: "whatsapp" }, module: "@commons/service/whatsapp", secrets: { app: "${SECRET_VIVA_WHATSAPP_APP}", verify: "${SECRET_VIVA_WHATSAPP_VERIFY}" } }],
  daemons: [{
    manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
    modes: [{ module: MODE, statics: { user: "finn", idle: 2 } }],
    consume: { whatsapp: { module: "@commons/service/whatsapp", statics: { graph: "http://localhost:1", number: "2", owner: OWNER }, secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" } } },
  }],
  environment: { ...hello.RECIPE.environment, properties: { ...hello.RECIPE.environment.properties, SECRET_VIVA_WHATSAPP_APP: doc("a"), SECRET_VIVA_WHATSAPP_VERIFY: doc("b"), SECRET_VIVA_WHATSAPP_TOKEN: doc("c") } },
};
let world;
try {
  world = await hello.launch({ prefix: "viva-turn-", ledger: hello.LEDGER, environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }), home: (home) => Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe, null, 2)) });
} catch (e) { console.log("BOOT FAILED:", e.message.split("\n").slice(0, 14).join("\n")); Deno.exit(0); }
try {
  const sign = async (body) => {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("app-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return `sha256=${encodeHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))}`;
  };
  const now = Math.floor(Date.now() / 1000);
  const post = async (id, body, at = now, extra = {}) => {
    const value = { messaging_product: "whatsapp", contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }], messages: [{ from: OWNER, timestamp: String(at), id, type: "text", text: { body }, ...extra }] };
    const raw = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value }] }] });
    const r = await fetch(`${world.origin}${HOOK}`, { method: "POST", headers: { "content-type": "application/json", "x-hub-signature-256": await sign(raw) }, body: raw });
    await r.body?.cancel(); await sleep.ms(250);
    return r.status;
  };
  const mark = world.log.length;
  console.log("before signup:", await post("wamid.EARLY", "nobody home"));
  const signup = await (await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" })).json();
  const login = await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json();
  const access = login.authority.access;
  const other = await (await world.post("/lighthouse/signup", { username: "eve", password: "hunter22" })).json();
  const eve = (await (await world.post("/lighthouse/login", { username: "eve", password: "hunter22" })).json()).authority.access;
  console.log("A", await post("wamid.A", "hi"));
  console.log("B", await post("wamid.B", "and tomorrow?"));
  console.log("A again (duplicate)", await post("wamid.A", "hi"));
  await sleep.ms(2300);
  console.log("C after the gap", await post("wamid.C", "whats on today"));
  console.log("/new", await post("wamid.N", "/new"));
  console.log("/new again (duplicate)", await post("wamid.N", "/new"));
  await sleep.ms(2300);
  console.log("D into the empty thread, after a gap", await post("wamid.D", "fresh start"));
  console.log("R reply to A", await post("wamid.R", "this one", now, { context: { id: "wamid.A" } }));
  const shape = world.query("select thread, json_extract(meta,'$.provider.id') as id, parent is not null as chained from Turn order by created_at");
  const order = [...new Set(world.query("select id from Thread order by created_at").map((t) => t.id))];
  console.log("--- threads", order.length, "turns per thread", JSON.stringify(shape.map((t) => [order.indexOf(t.thread) + 1, t.id, t.chained])));
  if (0) console.log("--- sql threads", JSON.stringify(world.query("select id, user, mode, traits from Thread order by created_at")));
  if (0) console.log("--- sql turns", JSON.stringify(world.query("select thread, role, parts, meta, parent, mode from Turn order by created_at")));
  const listed = await (await world.post("/userspace/entities/thread/find", { where: {} }, access)).json();
  console.log("--- finn lists threads:", listed.length, JSON.stringify(listed[0]));
  const eves = await (await world.post("/userspace/entities/thread/find", { where: {} }, eve)).json();
  console.log("--- eve lists threads:", JSON.stringify(eves));
  const turns = await (await world.post("/userspace/entities/turn/find", { where: { thread: listed[0].id } }, access)).json();
  console.log("--- finn reads turns of first thread:", JSON.stringify(turns));
  const daemon = await world.post("/daemon/hello/mode/bot/personal/entities/thread/find", { where: {} }, access);
  console.log("--- via the mode's own route:", daemon.status, (await daemon.text()).slice(0, 300));
  console.log("--- log"); for (const line of world.log.slice(mark)) if (/fault|PROBE|Error|│ (?!platform)/.test(line)) console.log("  " + line.slice(0, 240));
} finally { await world.stop(); }
