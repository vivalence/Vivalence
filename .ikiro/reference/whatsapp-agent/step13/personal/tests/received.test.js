import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { hello } from "@vivalence/runtime/scenarios";
import { sleep, specimen } from "@vivalence/typology";
import { STUB_FACULTIES } from "../../../../../../commons/fixtures/testing/data/stub.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const FINN = { profile: { name: "Finn" } };
const MODE = Deno.env.get("PERSONAL") ?? "@commons/bot/personal";
const SERVICE = Deno.env.get("WHATSAPP") ?? "@commons/service/whatsapp";

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

const recipe = (graph) => ({
  ...hello.RECIPE,
  runtime: {
    ...hello.RECIPE.runtime,
    hallucinators: [{ module: "@commons/hallucinator/stub", faculties: STUB_FACULTIES }],
  },
  services: [
    {
      manifest: { type: "service", slug: "whatsapp" },
      module: SERVICE,
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
          module: SERVICE,
          statics: { graph, number: "2", owner: OWNER },
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

describe("the bot answers — a message is a Turn, the harness replies through send", () => {
  const sent = [];
  let graph;
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

  const delivered = async (id, text, answers, context, contacts = [FINN]) => {
    const before = sent.length;
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
    const started = Date.now();
    while (sent.length < before + answers) {
      if (Date.now() - started > 5000) throw new Error(`${id}: ${sent.length - before} sent`);
      await sleep.ms(50);
    }
    await sleep.ms(400);
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
          "where json_extract(meta, '$.provider.id') is not null order by created_at",
      )
      .map((turn) => [threads().indexOf(turn.thread), turn.id, turn.parent !== null]);

  beforeAll(async () => {
    graph = Deno.serve({ port: 0, onListen: () => {} }, async (request) => {
      sent.push(await request.json());
      return Response.json({ messages: [{ id: `wamid.OUT${sent.length}` }] });
    });
    world = await hello.launch({
      prefix: "viva-personal-",
      ledger: hello.LEDGER,
      environment: (origin) => ({ ...hello.ENVIRONMENT(origin), ...SECRETS }),
      home: (home) =>
        Deno.writeTextFile(
          join(home, "instance.viva.json"),
          JSON.stringify(recipe(`http://localhost:${graph.addr.port}`), null, 2),
        ),
    });
  });

  afterAll(async () => {
    await world?.stop();
    await graph?.shutdown();
  });

  it("a message before its user exists is a fault; the runtime lives", async () => {
    expect(await delivered("wamid.EARLY", "nobody home", 0)).toBe(200);
    expect(world.log.some((line) => line.includes("UserEntity not found"))).toBe(true);
    expect(threads()).toEqual([]);
    const beacon = await fetch(`${world.origin}/beacon/status`);
    await beacon.body?.cancel();
    expect(beacon.status).toBe(200);
  });

  it("the first message makes a thread, the second chains into it", async () => {
    finn = await joined("finn");
    eve = await joined("eve");
    await delivered("wamid.A", "hi", 1);
    await delivered("wamid.B", "and tomorrow?", 1);
    expect(turns()).toEqual([
      [0, "wamid.A", false],
      [0, "wamid.B", true],
    ]);
  });

  it("the desk is a surface of the bot mode and bundles", async () => {
    const [surface] = world.query("select id, slug, mount, entry, traits from Surface");
    expect(surface.slug).toBe("desk");
    const served = await fetch(`${world.origin}/attached/surface/${surface.id}`, {
      headers: { authorization: `Bearer ${finn}` },
    });
    const text = await served.text();
    expect(served.status).toBe(200);
    expect(text.includes("setThread")).toBe(true);
  });

  it("the desk reads its settings off the mode", async () => {
    const response = await world.post("/daemon/hello/mode/bot/personal/settings", {}, finn);
    const settings = await response.json();
    expect(settings).toEqual({ user: "finn", idle: 2, platforms: ["whatsapp"] });
  });

  it("the harness's answer goes to the sender; the thread is harnessed", async () => {
    expect(sent.map((post) => [post.to, post.type, post.text.body])).toEqual([
      [OWNER, "text", "[stub] hi..."],
      [OWNER, "text", "[stub] and tomorrow?.."],
    ]);
    expect(world.query("select traits from Thread").map((thread) => thread.traits)).toEqual([
      '["HARNESSED","TOOLED"]',
    ]);
    const stored = world.query("select role, parent from Turn order by created_at");
    expect(stored.map((turn) => turn.role)).toEqual(["user", "assistant", "user", "assistant"]);
    expect(stored.slice(1).every((turn) => turn.parent !== null)).toBe(true);
  });

  it("a message id delivered twice is one Turn and one answer", async () => {
    await delivered("wamid.A", "hi", 0);
    expect(turns().length).toBe(2);
    expect(sent.length).toBe(2);
  });

  it("after the silence gap the next message opens a thread", async () => {
    await sleep.ms(2300);
    await delivered("wamid.C", "whats on today", 1);
    expect(turns().at(-1)).toEqual([1, "wamid.C", false]);
  });

  it("/new opens a thread and is no Turn; twice is still one thread", async () => {
    await delivered("wamid.N", "/new", 0);
    await delivered("wamid.N", "/new", 0);
    expect(threads().length).toBe(3);
    expect(turns().length).toBe(3);
  });

  it("an empty thread is entered, however long it waited", async () => {
    await sleep.ms(2300);
    await delivered("wamid.D", "fresh start", 1);
    await delivered("wamid.R", "this one", 1, { context: { id: "wamid.A" } });
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
    await delivered("wamid.BAD", "unreadable", 0, {}, []);
    expect(world.log.some((line) => line.includes("heard.js"))).toBe(true);
    await delivered("wamid.E", "still here", 1);
    expect(turns().at(-1)).toEqual([2, "wamid.E", true]);
  });

  it("an answer over the cap leaves in pieces, in order", async () => {
    const before = sent.length;
    await delivered("wamid.L", "word ".repeat(1000), 2);
    const pieces = sent.slice(before).map((post) => post.text.body);
    expect(pieces.map((piece) => piece.length)).toEqual([4096, 909]);
    expect(pieces.join(" ")).toBe(`[stub] ${"word ".repeat(1000).trim()}`);
  });

  it("a dock turn on a thread WhatsApp spoke in arrives quoted, then its answer", async () => {
    const [answer] = world.query(
      `select id from Turn where thread = '${threads()[0]}' and role = 'assistant' ` +
        "order by created_at desc limit 1",
    );
    await world.post(
      "/userspace/entities/turn/updateOne",
      { where: { id: answer.id }, data: { meta: { provider: { model: "stub" } } } },
      finn,
    );
    const before = sent.length;
    await world.post(
      "/daemon/hello/mode/bot/personal/harness/dialogue/render",
      { thread: threads()[0], parts: [{ type: "text", text: "from the dock\nline two" }] },
      finn,
    );
    await sleep.ms(500);
    expect(sent.slice(before).map((post) => [post.to, post.text.body])).toEqual([
      [OWNER, "> from the dock\n> line two"],
      [OWNER, "[stub] from the dock\nline two.."],
    ]);
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
