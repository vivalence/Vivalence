import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { hello } from "@vivalence/runtime/scenarios";
import { sleep, specimen } from "@vivalence/typology";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const STATE = { id: "2", status: "CONNECTED", webhook_configuration: { application: "https://a" } };

const LISTENER = `
import { Twitch } from "@vivalence/typology";

export const manifest = {
  type: "probe",
  slug: "listener",
  name: "Listener",
  version: "0.0.1",
  traits: ["TWITCHY"],
};

export const twitch = new Twitch().open("/after/mode/boot", (ctx) => {
  (async () => {
    for await (const message of ctx.providers.whatsapp.messages(undefined, ["4915100000000"])) {
      await Deno.writeTextFile("heard.log", JSON.stringify(message) + "\\n", { append: true });
      await ctx.providers.whatsapp.send(message.from, "heard " + message.id);
    }
  })();
});
`;

const SECRETS = {
  SECRET_VIVA_WHATSAPP_APP: "app-secret",
  SECRET_VIVA_WHATSAPP_VERIFY: "verify-token",
  SECRET_VIVA_WHATSAPP_TOKEN: "graph-token",
};

const documented = {
  SECRET_VIVA_WHATSAPP_APP: {
    type: "string",
    description: "The Meta app's secret; signs every delivery.",
  },
  SECRET_VIVA_WHATSAPP_VERIFY: {
    type: "string",
    description: "The word Meta repeats when it checks the webhook.",
  },
  SECRET_VIVA_WHATSAPP_TOKEN: { type: "string", description: "The Graph API token of the number." },
};

const recipe = (graph, listener) => ({
  ...hello.RECIPE,
  services: [
    {
      manifest: { type: "service", slug: "whatsapp" },
      module: "@commons/service/whatsapp",
      secrets: {
        app: "${SECRET_VIVA_WHATSAPP_APP}",
        verify: "${SECRET_VIVA_WHATSAPP_VERIFY}",
      },
    },
  ],
  daemons: [
    {
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      modes: [listener],
      consume: {
        whatsapp: {
          module: "@commons/service/whatsapp",
          statics: { graph, number: "2" },
          secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" },
        },
      },
    },
  ],
  environment: {
    ...hello.RECIPE.environment,
    properties: { ...hello.RECIPE.environment.properties, ...documented },
  },
});

const signature = async (secret, body) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `sha256=${encodeHex(signed)}`;
};

const delivery = (message) =>
  JSON.stringify(
    {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { phone_number_id: "2" },
                contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }],
                messages: [{ from: OWNER, timestamp: "1732440000", ...message }],
              },
            },
          ],
        },
      ],
    },
    null,
    1,
  );

describe("whatsapp service — hosted it answers Meta, consumed it yields and sends", () => {
  const asked = [];
  let graph;
  let modules;
  let world;

  const posted = async (body, headers) => {
    const response = await fetch(`${world.origin}${HOOK}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body,
    });
    await response.body?.cancel();
    return response.status;
  };

  const awaited = async (count, read) => {
    const started = Date.now();
    for (;;) {
      const held = await read();
      if (held.length >= count) return held;
      if (Date.now() - started > 5000) throw new Error(`${held.length} held, ${count} awaited`);
      await sleep.ms(50);
    }
  };

  const heard = (count) =>
    awaited(count, async () => {
      const log = await Deno.readTextFile(join(world.root, "instance/heard.log")).catch(() => "");
      return log
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    });

  const reached = (count) => awaited(count, () => asked);

  beforeAll(async () => {
    graph = Deno.serve({ port: 0, onListen: () => {} }, async (request) => {
      const url = new URL(request.url);
      asked.push([request.method, url.pathname, request.headers.get("authorization")]);
      await request.body?.cancel();
      if (url.pathname === "/778") {
        const held = { url: `${url.origin}/bytes/778`, mime_type: "audio/ogg; codecs=opus" };
        return Response.json(held);
      }
      if (url.pathname === "/bytes/778") return new Response(new Uint8Array([79, 103, 103, 83]));
      if (url.pathname === "/2") return Response.json(STATE);
      if (url.pathname === "/2/messages") return Response.json({ messages: [{ id: "wamid.OUT" }] });
      return new Response("no such thing", { status: 404 });
    });
    modules = await Deno.makeTempDir({ prefix: "viva-whatsapp-modules-" });
    await Deno.writeTextFile(join(modules, "listener.viva.js"), LISTENER);
    world = await hello.launch({
      prefix: "viva-whatsapp-",
      ledger: hello.LEDGER,
      environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }),
      home: (home) =>
        Deno.writeTextFile(
          join(home, "instance.viva.json"),
          JSON.stringify(
            recipe(`http://localhost:${graph.addr.port}`, join(modules, "listener.viva.js")),
            null,
            2,
          ),
        ),
    });
  });

  afterAll(async () => {
    await world?.stop();
    await graph?.shutdown();
    if (modules) await Deno.remove(modules, { recursive: true });
  });

  it("Meta's challenge comes back as plain text, without a login", async () => {
    const query = "hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=1158201444";
    const response = await fetch(`${world.origin}${HOOK}?${query}`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("1158201444");
  });

  it("a challenge with the wrong word is refused", async () => {
    const query = "hub.mode=subscribe&hub.verify_token=nope&hub.challenge=1158201444";
    const response = await fetch(`${world.origin}${HOOK}?${query}`);
    await response.body?.cancel();
    expect(response.status).toBe(403);
  });

  it("a delivery unsigned, signed with another secret, or with no hex is refused", async () => {
    const body = delivery({ id: "wamid.U", type: "text", text: { body: "forged" } });
    expect(await posted(body, {})).toBe(403);
    const forged = await signature("other-secret", body);
    expect(await posted(body, { "x-hub-signature-256": forged })).toBe(403);
    expect(await posted(body, { "x-hub-signature-256": "sha256=zz" })).toBe(403);
  });

  it("a signed text reaches the consuming mode, and its send reaches Graph", async () => {
    const body = delivery({ id: "wamid.A", type: "text", text: { body: "hi" } });
    const signed = await signature(SECRETS.SECRET_VIVA_WHATSAPP_APP, body);
    expect(await posted(body, { "x-hub-signature-256": signed })).toBe(200);

    const [message] = await heard(1);
    expect(message.id).toBe("wamid.A");
    expect(message.parts).toEqual([{ type: "text", text: "hi" }]);
    expect(await reached(1)).toEqual([["POST", "/2/messages", "Bearer graph-token"]]);
  });

  it("a signed voice note arrives with the bytes Graph handed over", async () => {
    const audio = { id: "778", mime_type: "audio/ogg; codecs=opus", voice: true };
    const body = delivery({ id: "wamid.B", type: "audio", audio });
    const signed = await signature(SECRETS.SECRET_VIVA_WHATSAPP_APP, body);
    expect(await posted(body, { "x-hub-signature-256": signed })).toBe(200);

    const [, message] = await heard(2);
    expect(message.parts).toEqual([
      { type: "audio", data: "T2dnUw==", mime: "audio/ogg; codecs=opus" },
    ]);
    expect((await reached(4)).slice(1, 3)).toEqual([
      ["GET", "/778", "Bearer graph-token"],
      ["GET", "/bytes/778", "Bearer graph-token"],
    ]);
  });

  it("a signed delivery for a number no bot here serves is taken and dropped", async () => {
    const body = delivery({ id: "wamid.C", type: "text", text: { body: "elsewhere" } }).replace(
      '"phone_number_id": "2"',
      '"phone_number_id": "9"',
    );
    const signed = await signature(SECRETS.SECRET_VIVA_WHATSAPP_APP, body);
    expect(await posted(body, { "x-hub-signature-256": signed })).toBe(200);
    await sleep.ms(200);
    expect((await heard(2)).map((message) => message.id)).toEqual(["wamid.A", "wamid.B"]);
  });

  it("the forged deliveries never reached the mode", async () => {
    expect((await heard(2)).map((message) => message.id)).toEqual(["wamid.A", "wamid.B"]);
  });

  it("the number's state is behind a login", async () => {
    const response = await world.post("/runtime/house/service/whatsapp/state", { number: "2" });
    await response.body?.cancel();
    expect(response.status).toBe(401);
  });

  it("logged in, the state is what Graph holds for the number", async () => {
    const account = { username: "finn", password: "hunter22" };
    await (await world.post("/lighthouse/signup", account)).json();
    const login = await world.post("/lighthouse/login", account);
    const { access } = (await login.json()).authority;
    const numbers = await world.post("/runtime/house/service/whatsapp/numbers", {}, access);
    expect(await numbers.json()).toEqual(["2"]);
    const state = { number: "2" };
    const response = await world.post("/runtime/house/service/whatsapp/state", state, access);
    expect(await response.json()).toEqual(STATE);
    expect(asked.at(-1)).toEqual(["GET", "/2", "Bearer graph-token"]);
    const other = { number: "9" };
    const stray = await world.post("/runtime/house/service/whatsapp/state", other, access);
    await stray.body?.cancel();
    expect(stray.ok).toBe(false);
  });
});
