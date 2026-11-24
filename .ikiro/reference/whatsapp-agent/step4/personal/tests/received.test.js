import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { hello } from "@vivalence/runtime/scenarios";
import { sleep, specimen } from "@vivalence/typology";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const MODE = Deno.env.get("PERSONAL") ?? "@commons/bot/personal";

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

const recipe = {
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
      modes: [{ module: MODE, statics: { user: "finn", idle: 2 } }],
      consume: {
        whatsapp: {
          module: "@commons/service/whatsapp",
          statics: { graph: "http://localhost:1", number: "2", owner: OWNER },
          secrets: { token: "${SECRET_VIVA_WHATSAPP_TOKEN}" },
        },
      },
    },
  ],
  environment: {
    ...hello.RECIPE.environment,
    properties: { ...hello.RECIPE.environment.properties, ...documented },
  },
};

describe("a message is a Turn — the bot mode beside the WhatsApp service", () => {
  let world;
  let finn;
  let eve;

  const signature = async (body) => {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRETS.SECRET_VIVA_WHATSAPP_APP),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    return `sha256=${encodeHex(signed)}`;
  };

  const delivered = async (id, text, context, contacts = [{ profile: { name: "Finn" } }]) => {
    const message = {
      from: OWNER,
      timestamp: "1732440000",
      id,
      type: "text",
      text: { body: text },
      ...context,
    };
    const body = JSON.stringify({
      object: "whatsapp_business_account",
      entry: [
        {
          id: "1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                contacts,
                messages: [message],
              },
            },
          ],
        },
      ],
    });
    const response = await fetch(`${world.origin}${HOOK}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": await signature(body),
      },
      body,
    });
    await response.body?.cancel();
    await sleep.ms(300);
    return response.status;
  };

  const joined = async (username) => {
    await (await world.post("/lighthouse/signup", { username, password: "hunter22" })).json();
    const login = await world.post("/lighthouse/login", { username, password: "hunter22" });
    return (await login.json()).authority.access;
  };

  const threads = () =>
    world.query("select id from Thread order by created_at").map((thread) => thread.id);

  const turns = () =>
    world
      .query(
        "select thread, json_extract(meta, '$.provider.id') as id, parent from Turn " +
          "order by created_at",
      )
      .map((turn) => [threads().indexOf(turn.thread), turn.id, turn.parent !== null]);

  beforeAll(async () => {
    world = await hello.launch({
      prefix: "viva-personal-",
      ledger: hello.LEDGER,
      environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }),
      home: (home) =>
        Deno.writeTextFile(join(home, "instance.viva.json"), JSON.stringify(recipe, null, 2)),
    });
  });

  afterAll(async () => {
    await world?.stop();
  });

  it("a message before its user exists is a fault; the runtime lives", async () => {
    expect(await delivered("wamid.EARLY", "nobody home")).toBe(200);
    expect(world.log.some((line) => line.includes("UserEntity not found"))).toBe(true);
    expect(threads()).toEqual([]);
    const beacon = await fetch(`${world.origin}/beacon/status`);
    await beacon.body?.cancel();
    expect(beacon.status).toBe(200);
  });

  it("the first message makes a thread, the second chains into it", async () => {
    finn = await joined("finn");
    eve = await joined("eve");
    await delivered("wamid.A", "hi");
    await delivered("wamid.B", "and tomorrow?");
    expect(turns()).toEqual([
      [0, "wamid.A", false],
      [0, "wamid.B", true],
    ]);
  });

  it("a message id delivered twice is one Turn", async () => {
    await delivered("wamid.A", "hi");
    expect(turns().length).toBe(2);
  });

  it("after the silence gap the next message opens a thread", async () => {
    await sleep.ms(2300);
    await delivered("wamid.C", "whats on today");
    expect(turns().at(-1)).toEqual([1, "wamid.C", false]);
  });

  it("/new opens a thread and is no Turn; twice is still one thread", async () => {
    await delivered("wamid.N", "/new");
    await delivered("wamid.N", "/new");
    expect(threads().length).toBe(3);
    expect(turns().length).toBe(3);
  });

  it("an empty thread is entered, however long it waited", async () => {
    await sleep.ms(2300);
    await delivered("wamid.D", "fresh start");
    await delivered("wamid.R", "this one", { context: { id: "wamid.A" } });
    expect(turns().slice(-2)).toEqual([
      [2, "wamid.D", false],
      [2, "wamid.R", true],
    ]);
    const [stored] = world.query(
      "select meta from Turn where json_extract(meta, '$.provider.id') = 'wamid.R'",
    );
    expect(JSON.parse(stored.meta).provider.about).toEqual({ id: "wamid.A", act: "reply" });
  });

  it("a delivery the service cannot read is a fault; the next message arrives", async () => {
    await delivered("wamid.BAD", "unreadable", {}, []);
    expect(world.log.some((line) => line.includes("heard.js"))).toBe(true);
    await delivered("wamid.E", "still here");
    expect(turns().at(-1)).toEqual([2, "wamid.E", true]);
  });

  it("the owner lists the threads, another user none", async () => {
    const mine = await world.post("/userspace/entities/thread/find", { where: {} }, finn);
    expect((await mine.json()).map((thread) => thread.id).sort()).toEqual(threads().sort());
    const theirs = await world.post("/userspace/entities/thread/find", { where: {} }, eve);
    expect(await theirs.json()).toEqual([]);
  });

  it("SIGTERM releases the pull: the runtime exits 0", async () => {
    world.child.kill("SIGTERM");
    expect((await world.child.status).code).toBe(0);
  });
});
