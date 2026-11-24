import { join } from "@std/path";
import * as hello from "../../../systems/runtime/tests/scenarios/hello.js";

const SERVICE = `
import { Queue, Vector } from "@vivalence/typology";

const inbox = new Queue();

export const manifest = { type: "service", slug: "inbox", name: "Inbox", version: "0.0.1", traits: ["ATTACHED"] };

export const attachment = new Vector().open("/webhook", (ctx) => {
  inbox.enqueue(ctx.request.body);
  return { queued: inbox.depth, keys: Object.keys(ctx) };
});

export function provider() {
  return { messages: (signal) => inbox.drain(signal) };
}
`;

const MODE = `
import { Twitch } from "@vivalence/typology";

export const manifest = { type: "probe", slug: "listener", name: "Listener", version: "0.0.1", traits: ["TWITCHY"] };

export const twitch = new Twitch().open("/after/mode/boot", (ctx) => {
  (async () => {
    for await (const message of ctx.providers.inbox.messages())
      await Deno.writeTextFile("heard.log", JSON.stringify(message) + "\\n", { append: true });
  })();
});
`;

const modules = await Deno.makeTempDir({ prefix: "viva-inbox-modules-" });
await Deno.writeTextFile(join(modules, "service.viva.js"), SERVICE);
await Deno.writeTextFile(join(modules, "mode.viva.js"), MODE);

const recipe = {
  ...hello.RECIPE,
  services: [{ manifest: { type: "service", slug: "inbox" }, module: join(modules, "service.viva.js") }],
  daemons: [
    {
      manifest: { type: "daemon", slug: "hello", version: "0.0.1" },
      modes: [join(modules, "mode.viva.js")],
      consume: { inbox: { module: join(modules, "service.viva.js") } },
    },
  ],
};

const report = {};
let world;
try {
  world = await hello.boot({ recipe, prefix: "viva-inbox-" });
  report.ready = world.ready;
  report.attached = world.log.filter((line) => /inbox|listener|dormant/i.test(line)).slice(0, 12);
  report.hooks = {};
  for (const path of ["/attached/process/service/service/inbox/webhook", "/attached/process/service/inbox/webhook"]) {
    const response = await world.post(path, { text: `hi via ${path}` });
    report.hooks[path] = [response.status, await response.text()];
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  report.heard = await Deno.readTextFile(join(world.root, "instance/heard.log")).catch((error) => error.message);
} catch (error) {
  report.failed = error.message.split("\n").slice(0, 30);
} finally {
  await world?.stop();
  await Deno.remove(modules, { recursive: true });
}
console.log(JSON.stringify(report, null, 2));
