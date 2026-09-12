import { sleep } from "@vivalence/typology";
import { create, TOKENS } from "../../scenarios/activity.js";

const flag = (name, fallback) => {
  const at = Deno.args.indexOf(`--${name}`);
  return at === -1 ? fallback : (Deno.args[at + 1] ?? true);
};
const args = { port: Number(flag("port", 7710)), tick: Number(flag("tick", 400)), cron: Deno.args.includes("--cron"), silent: Deno.args.includes("--silent"), panel: Deno.args.includes("--panel") };
const stamp = () => new Date().toISOString().slice(11, 23);
const log = args.silent || args.panel ? () => {} : (...parts) => console.log(`[daemon ${stamp()}]`, ...parts);

const world = await create({ port: args.port });
const { user, stranger } = world.fixtures;
const thread = await world.createThread();
const activities = world.daemon.entities.activity;
const fixtures = { user: user.id, stranger: stranger.id, mode: world.dewey.id, thread: thread.id, tokens: TOKENS };

activities.$entities.subscribe((held) => log("store", held.map((row) => `${row.id.slice(-6)}:${row.status}`).join(" ") || "∅"));

if (!args.panel) {
  console.log(`READY ${world.url.absolute}`);
  console.log(`FIXTURES ${JSON.stringify(fixtures)}`);
}

const closing = async () => {
  log("closing");
  await world.close();
  Deno.exit(0);
};
Deno.addSignalListener("SIGINT", closing);
Deno.addSignalListener("SIGTERM", closing);

if (args.cron) {
  setInterval(() => world.clock.release(1), args.tick);
  for (;;) {
    const stream = await world.dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text: "go" }] });
    for await (const packet of stream) log("packet", packet.event);
    await sleep.ms(args.tick);
  }
}

if (args.panel) {
  const { mount } = await import("../../../../kajuit/tests/interactive/activity/sheet.jsx");
  setInterval(() => world.clock.release(1), args.tick);
  (async () => {
    for (;;) {
      const stream = await world.dewey.harness.dialogue.stream({ thread: thread.id, parts: [{ type: "text", text: "go" }] });
      for await (const _ of stream) void _;
      await sleep.ms(args.tick * 4);
    }
  })();
  await mount({
    title: `runtime · held · ${world.url.absolute}`,
    repository: activities,
    signal: (row, name, input) => row.stdin[name](input),
    close: closing,
  });
}

await new Promise(() => {});
