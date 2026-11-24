import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import * as hello from "../../../systems/runtime/tests/scenarios/hello.js";

const SERVICE = new URL(`./${Deno.env.get("SOCIAL") ?? "social"}/whatsapp/service.viva.js`, import.meta.url).pathname;

const MODE = `
import { Twitch } from "@vivalence/typology";

export const manifest = { type: "probe", slug: "listener", name: "Listener", version: "0.0.1", traits: ["TWITCHY"] };

export const twitch = new Twitch().open("/after/mode/boot", (ctx) => {
  (async () => {
    while (true)
      try {
        for await (const message of ctx.providers.whatsapp.messages()) {
          await Deno.writeTextFile("heard.log", JSON.stringify(message) + "\\n", { append: true });
          await ctx.providers.whatsapp.send(message.from, "heard " + message.id);
        }
      } catch (fault) {
        if (!${Deno.env.get("CATCH") === "1"}) throw fault;
        await Deno.writeTextFile("heard.log", JSON.stringify({ fault: fault.message }) + "\\n", { append: true });
      }
  })();
});
`;

const asked = [];
let mended = false;
const graph = Deno.serve({ port: 0, onListen: () => {} }, async (request) => {
  const url = new URL(request.url);
  asked.push([request.method, url.pathname, request.headers.get("authorization"), await request.text()]);
  if (url.pathname === "/778") return Response.json({ url: `${url.origin}/bytes/778`, mime_type: "audio/ogg; codecs=opus" });
  if (url.pathname === "/bytes/778") return new Response(new Uint8Array([79, 103, 103, 83]));
  if (url.pathname === "/999" && mended) return Response.json({ url: `${url.origin}/bytes/778`, mime_type: "audio/ogg; codecs=opus" });
  if (url.pathname === "/2/messages") return Response.json({ messages: [{ id: "wamid.OUT" }] });
  return new Response("no such thing", { status: 404 });
});
const GRAPH = `http://localhost:${graph.addr.port}`;

const modules = await Deno.makeTempDir({ prefix: "viva-whatsapp-modules-" });
await Deno.writeTextFile(join(modules, "mode.viva.js"), MODE);

const recipe = {
  ...hello.RECIPE,
  environment: {
    ...hello.RECIPE.environment,
    properties: {
      ...hello.RECIPE.environment.properties,
      SECRET_VIVA_WHATSAPP_APP: { type: "string", description: "The Meta app's secret; signs every delivery." },
      SECRET_VIVA_WHATSAPP_VERIFY: { type: "string", description: "The word Meta repeats when it checks the webhook." },
      SECRET_VIVA_WHATSAPP_TOKEN: { type: "string", description: "The Graph API token of the number." },
    },
  },
  services: [
    {
      manifest: { type: "service", slug: "whatsapp" },
      module: SERVICE,
      ...(Deno.env.get("SOCIAL") === "social-c"
        ? {
            statics: { graph: GRAPH, owner: "4915100000000" },
            secrets: { app: "${SECRET_VIVA_WHATSAPP_APP}", verify: "${SECRET_VIVA_WHATSAPP_VERIFY}", token: "${SECRET_VIVA_WHATSAPP_TOKEN}" },
          }
        : { secrets: { app: "${SECRET_VIVA_WHATSAPP_APP}", verify: "${SECRET_VIVA_WHATSAPP_VERIFY}" } }),
    },
  ],
  daemons: [
    {
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      modes: [join(modules, "mode.viva.js")],
      consume: {
        whatsapp: {
          module: SERVICE,
          statics: { graph: GRAPH, number: "2", owner: "4915100000000" },
          secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" },
        },
      },
    },
  ],
};

const wrap = (...messages) => ({
  object: "whatsapp_business_account",
  entry: [{ id: "1", changes: [{ field: "messages", value: {
    messaging_product: "whatsapp",
    contacts: [{ profile: { name: "Finn" }, wa_id: "4915100000000" }],
    messages,
  } }] }],
});
const base = { from: "4915100000000", timestamp: "1732440000" };

const signature = async (secret, body) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return "sha256=" + encodeHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
};

const HOOK = "/attached/process/service/service/whatsapp/webhook";
const report = {};
let world;
try {
  world = await hello.launch({
    prefix: "viva-whatsapp-",
    ledger: hello.LEDGER,
    environment: (origin) => ({
      ...hello.ENVIRONMENT(origin),
      SECRET_VIVA_WHATSAPP_APP: "app-secret",
      SECRET_VIVA_WHATSAPP_VERIFY: "verify-token",
      SECRET_VIVA_WHATSAPP_TOKEN: "graph-token",
    }),
    home: (home) => Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe, null, 2)),
  });
  const deliver = async (payload, headers) => {
    const body = JSON.stringify(payload, null, 1);
    const response = await fetch(`${world.origin}${HOOK}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(await headers(body)) },
      body,
    });
    return [response.status, await response.text()];
  };
  const good = async (body) => ({ "x-hub-signature-256": await signature("app-secret", body) });

  const challenge = await fetch(`${world.origin}${HOOK}?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=1158201444`);
  report.challenge = [challenge.status, await challenge.text(), challenge.headers.get("content-type")];
  const wrong = await fetch(`${world.origin}${HOOK}?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1158201444`);
  report.wrongToken = [wrong.status, await wrong.text()];

  report.unsigned = await deliver(wrap({ ...base, id: "wamid.U", type: "text", text: { body: "unsigned" } }), () => ({}));
  report.forged = await deliver(wrap({ ...base, id: "wamid.X", type: "text", text: { body: "forged" } }), async (body) => ({ "x-hub-signature-256": await signature("other-secret", body) }));
  report.garbage = await deliver(wrap({ ...base, id: "wamid.Z", type: "text", text: { body: "garbage" } }), () => ({ "x-hub-signature-256": "sha256=zz" }));
  report.text = await deliver(wrap({ ...base, id: "wamid.A", type: "text", text: { body: "hi" } }), good);
  report.voice = await deliver(wrap({ ...base, id: "wamid.B", type: "audio", audio: { id: "778", mime_type: "audio/ogg; codecs=opus", voice: true } }), good);
  report.stranger = await deliver(wrap({ ...base, from: "15550009999", id: "wamid.S", type: "audio", audio: { id: "778" } }), good);
  report.statuses = await deliver({ object: "whatsapp_business_account", entry: [{ id: "1", changes: [{ field: "messages", value: { messaging_product: "whatsapp", statuses: [{ id: "wamid.OUT", status: "delivered" }] } }] }] }, good);

  await new Promise((resolve) => setTimeout(resolve, 800));
  report.heard = (await Deno.readTextFile(join(world.root, "instance/heard.log")).catch((error) => error.message)).trim().split("\n");
  report.graph = asked;
  report.lost = await deliver(wrap({ ...base, id: "wamid.L", type: "audio", audio: { id: "999" } }), good);
  await new Promise((resolve) => setTimeout(resolve, 800));
  mended = true;
  report.again = await deliver(wrap({ ...base, id: "wamid.L", type: "audio", audio: { id: "999" } }), good).catch((error) => error.message);
  report.after = await deliver(wrap({ ...base, id: "wamid.M", type: "text", text: { body: "still there?" } }), good).catch((error) => [error.message, String(error.cause)]);
  await new Promise((resolve) => setTimeout(resolve, 800));
  report.heardAfter = (await Deno.readTextFile(join(world.root, "instance/heard.log"))).trim().split("\n");
  report.tail = world.log.slice(-6);
  report.faults = world.log.filter((line) => /error|fault|whatsapp:/i.test(line)).slice(0, 8);
} catch (error) {
  report.failed = error.message.split("\n").slice(0, 30);
} finally {
  await world?.stop();
  await graph.shutdown();
  await Deno.remove(modules, { recursive: true });
}
console.log(JSON.stringify(report, null, 1));
