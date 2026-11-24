import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { sleep } from "@vivalence/typology";
import * as hello from "../../../systems/runtime/tests/scenarios/hello.js";
import { STUB_FACULTIES } from "../../../commons/fixtures/testing/data/stub.js";

const MODE = new URL("./step5/personal/personal.viva.js", import.meta.url).pathname;
const SERVICE = new URL("./step5/whatsapp/service.viva.js", import.meta.url).pathname;
const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const SECRETS = { SECRET_VIVA_WHATSAPP_APP: "app-secret", SECRET_VIVA_WHATSAPP_VERIFY: "verify-token", SECRET_VIVA_WHATSAPP_TOKEN: "graph-token" };
const doc = (description) => ({ type: "string", description });
const asked = [];
const graph = Deno.serve({ port: 0, onListen: () => {} }, async (request) => {
  asked.push([new URL(request.url).pathname, await request.json().catch(() => null)]);
  return Response.json({ messages: [{ id: "wamid.OUT" + asked.length }] });
});
const recipe = {
  ...hello.RECIPE,
  runtime: { ...hello.RECIPE.runtime, hallucinators: [{ module: "@commons/hallucinator/stub", faculties: STUB_FACULTIES }] },
  services: [{ manifest: { type: "service", slug: "whatsapp" }, module: SERVICE, secrets: { app: "${SECRET_VIVA_WHATSAPP_APP}", verify: "${SECRET_VIVA_WHATSAPP_VERIFY}" } }],
  daemons: [{
    manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
    modes: [{ module: MODE, statics: { user: "finn", idle: 2 } }],
    consume: { whatsapp: { module: SERVICE, statics: { graph: `http://localhost:${graph.addr.port}`, number: "2", owner: OWNER }, secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" } } },
  }],
  environment: { ...hello.RECIPE.environment, properties: { ...hello.RECIPE.environment.properties, SECRET_VIVA_WHATSAPP_APP: doc("a"), SECRET_VIVA_WHATSAPP_VERIFY: doc("b"), SECRET_VIVA_WHATSAPP_TOKEN: doc("c") } },
};
let world;
try {
  world = await hello.launch({ prefix: "viva-answer-", ledger: hello.LEDGER, environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }), home: (home) => Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe, null, 2)) });
} catch (e) { console.log("BOOT FAILED:", e.message.split("\n").slice(0, 16).join("\n")); await graph.shutdown(); Deno.exit(0); }
try {
  const sign = async (body) => {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode("app-secret"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return `sha256=${encodeHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))}`;
  };
  const post = async (id, body, wait = 1500) => {
    const value = { messaging_product: "whatsapp", contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }], messages: [{ from: OWNER, timestamp: "1732440000", id, type: "text", text: { body } }] };
    const raw = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value }] }] });
    const r = await fetch(`${world.origin}${HOOK}`, { method: "POST", headers: { "content-type": "application/json", "x-hub-signature-256": await sign(raw) }, body: raw });
    await r.body?.cancel(); await sleep.ms(wait);
    return r.status;
  };
  await (await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" })).json();
  const access = (await (await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })).json()).authority.access;
  const mark = world.log.length;
  console.log("A", await post("wamid.A", "hi"));
  console.log("A again", await post("wamid.A", "hi", 600));
  console.log("B", await post("wamid.B", "and tomorrow?"));
  console.log("LONG", await post("wamid.L", "word ".repeat(1000), 2500));
  console.log("NOSPACE", await post("wamid.X", "x".repeat(9000), 2500)); // no-space
  console.log("TOOL", await post("wamid.T", "look --tool modes", 2500));
  console.log("--- sent to Graph:", JSON.stringify(asked.map(([path, body]) => [path, body?.to, body?.text?.body.length, body?.text?.body.slice(0, 60)])));
  console.log("--- threads", JSON.stringify(world.query("select traits from Thread")));
  console.log("--- turns", JSON.stringify(world.query("select role, substr(parts,1,90) as parts, json_extract(meta,'$.provider.id') as id, json_extract(meta,'$.state') as state, parent is not null as chained, mode is not null as moded from Turn order by created_at")));
  const meta = await world.post("/daemon/hello/mode/bot/personal/metadata/harness", {}, access);
  const harness = await meta.json();
  const names = (node, prefix = "") => Object.entries(node ?? {}).flatMap(([key, value]) => (value && typeof value === "object" && !("valence" in value) && !("effect" in value) ? names(value, `${prefix}/${key}`) : [`${prefix}/${key}`]));
  const natures = (node, prefix = "") => Object.entries(node.branches ?? {}).flatMap(([key, next]) => [...(next.effect ? [`${prefix}/${key}`] : []), ...natures(next, `${prefix}/${key}`)]);
  console.log("--- armed tools:", meta.status, JSON.stringify(natures(harness.tools)));
  console.log("--- primer:", JSON.stringify(natures(harness.primer)), "home", JSON.stringify(harness.home));
} finally { await world.stop(); await graph.shutdown(); }
