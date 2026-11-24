import { encodeHex } from "@std/encoding";
import { join } from "@std/path";
import { hello } from "@vivalence/runtime/scenarios";
import { Queue, sleep, specimen } from "@vivalence/typology";
import { boot } from "../boot.js";

const { describe, it, expect, beforeAll, afterAll } = specimen;

const HOOK = "/attached/process/service/service/whatsapp/webhook";
const OWNER = "4915100000000";
const MODE = new URL("../personal.viva.js", import.meta.url).pathname;

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
      modes: [MODE],
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

const stage = () => {
  const inbox = new Queue();
  const logged = [];
  const faults = [];
  const modeDie = {
    mode: {
      stdout: {
        log: (message) => {
          if (message.id === "unreceivable") throw new Error("received broke");
          logged.push(message.id);
        },
        fault: (error) => faults.push(error.message),
      },
    },
    providers: {
      whatsapp: {
        async *messages(signal) {
          for await (const message of inbox.drain(signal)) {
            if (message.id === "unreadable") throw new Error("heard broke");
            yield message;
          }
        },
      },
    },
  };
  return { inbox, logged, faults, modeDie };
};

describe("the bot's pull — one loop per platform, owned by boot", () => {
  it("a message the platform yields reaches the mode", async () => {
    const { inbox, logged, modeDie } = stage();
    const release = boot(modeDie, { statics: { platforms: ["whatsapp"] } });
    inbox.enqueue({ id: "a" }).enqueue({ id: "b" });
    await sleep.ms(20);
    await release();
    expect(logged).toEqual(["a", "b"]);
  });

  it("a fault on the platform's side is written and the next message arrives", async () => {
    const { inbox, logged, faults, modeDie } = stage();
    const release = boot(modeDie, { statics: { platforms: ["whatsapp"] } });
    inbox.enqueue({ id: "a" }).enqueue({ id: "unreadable" }).enqueue({ id: "b" });
    await sleep.ms(20);
    await release();
    expect(logged).toEqual(["a", "b"]);
    expect(faults).toEqual(["heard broke"]);
  });

  it("a fault on the mode's side is written and the next message arrives", async () => {
    const { inbox, logged, faults, modeDie } = stage();
    const release = boot(modeDie, { statics: { platforms: ["whatsapp"] } });
    inbox.enqueue({ id: "a" }).enqueue({ id: "unreceivable" }).enqueue({ id: "b" });
    await sleep.ms(20);
    await release();
    expect(logged).toEqual(["a", "b"]);
    expect(faults).toEqual(["received broke"]);
  });

  it("the release ends the pull: a later message stays in the queue", async () => {
    const { inbox, logged, modeDie } = stage();
    const release = boot(modeDie, { statics: { platforms: ["whatsapp"] } });
    await release();
    inbox.enqueue({ id: "late" });
    await sleep.ms(20);
    expect(logged).toEqual([]);
    expect(inbox.depth).toBe(1);
  });

  it("a platform the daemon does not consume fails the boot", () => {
    const { modeDie } = stage();
    expect(() => boot(modeDie, { statics: { platforms: ["telegram"] } })).toThrow();
  });
});

describe("the bot mode, served beside the WhatsApp service", () => {
  let world;

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

  const delivered = async (value) => {
    const body = JSON.stringify({
      object: "whatsapp_business_account",
      entry: [{ id: "1", changes: [{ field: "messages", value }] }],
    });
    const response = await fetch(`${world.origin}${HOOK}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-hub-signature-256": await signature(body) },
      body,
    });
    await response.body?.cancel();
    return response.status;
  };

  const text = (id) => ({
    messaging_product: "whatsapp",
    contacts: [{ profile: { name: "Finn" }, wa_id: OWNER }],
    messages: [{ from: OWNER, timestamp: "1732440000", id, type: "text", text: { body: "hi" } }],
  });

  const logged = async (word) => {
    const started = Date.now();
    while (!world.log.some((line) => line.includes(word))) {
      if (Date.now() - started > 5000) throw new Error(`${word} never logged`);
      await sleep.ms(50);
    }
    return true;
  };

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

  it("a signed delivery reaches the mode", async () => {
    expect(await delivered(text("wamid.A"))).toBe(200);
    expect(await logged("id wamid.A")).toBe(true);
  });

  it("a delivery the service cannot read is a fault; the runtime lives, the next arrives", async () => {
    const { contacts: _contacts, ...unreadable } = text("wamid.BAD");
    expect(await delivered(unreadable)).toBe(200);
    expect(await logged("heard.js")).toBe(true);
    expect(await delivered(text("wamid.B"))).toBe(200);
    expect(await logged("id wamid.B")).toBe(true);
    const beacon = await fetch(`${world.origin}/beacon/status`);
    await beacon.body?.cancel();
    expect(beacon.status).toBe(200);
  });

  it("SIGTERM releases the pull: the runtime exits 0", async () => {
    world.child.kill("SIGTERM");
    expect((await world.child.status).code).toBe(0);
  });
});
