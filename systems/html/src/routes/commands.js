import { Vector, steer } from "@vivalence/typology";
import { lighthouse } from "$client";
import { terminal as terminalWafer } from "../terminal/index.js";

export const commands = new Vector();

function findMode(slug) {
  for (const [, daemon] of lighthouse.daemons) {
    const mode = daemon.entities.mode.$entities.get().find((m) => m.slug === slug);
    if (mode) return { daemon, mode };
  }
  return {};
}

async function openThread(terminal, daemon, thread) {
  await steer.invoke(
    terminalWafer,
    "/construct/populate/resolve/integrate",
    steer.direct,
  )({ good: terminal, variant: { daemon, thread } });
  terminal.phase = "STREAM";
}

commands.open("/list", async () => {
  if (!lighthouse.daemons.size) return "no daemons connected";

  const lines = [];
  for (const [slug, daemon] of lighthouse.daemons) {
    lines.push(daemon.manifest?.name ?? slug);
    for (const mode of daemon.entities.mode.$entities.get()) {
      const intents = [...mode.intents].map((i) => i.slug).join(", ");
      lines.push(`  ${mode.type}/${mode.slug}${intents ? ` (${intents})` : ""}`);
    }
  }
  return lines.join("\n");
});

commands.open("/open", async (context) => {
  const terminal = context.terminal;
  const slug = context.signal.absolute?.[1];
  const intentSlug = context.signal.absolute?.[2];
  if (!slug) return "usage: open <mode> [intent]";

  const { daemon, mode } = findMode(slug);
  if (!mode) return `mode not found: ${slug}`;

  const intent = intentSlug
    ? [...mode.intents].find((i) => i.slug === intentSlug)
    : [...mode.intents].find((i) => i.type === "APPLICATIVE" && i.trait?.FEEDING);

  const thread = await daemon.entities.thread.create({
    mode: mode.id,
    intent: intent?.id ?? null,
  });
  thread.mode = mode;
  if (intent) thread.intent = intent;

  await openThread(terminal, daemon, thread);
  return `${mode.type}/${mode.slug}${intent ? ` ${intent.slug}` : ""}`;
});

commands.open("/threads", async () => {
  if (!lighthouse.daemons.size) return "no daemons connected";

  const lines = [];
  for (const [, daemon] of lighthouse.daemons) {
    const threads = await daemon.entities.thread.find({}, { populate: ["mode", "intent"] });
    if (!threads.length) continue;
    lines.push(daemon.manifest?.name ?? daemon.slug);
    for (const thread of threads.slice(0, 20)) {
      const label = thread.mode?.slug ?? "?";
      const suffix = thread.intent ? ` ${thread.intent.slug}` : "";
      lines.push(`  ${thread.id}  ${label}${suffix}`);
    }
  }
  return lines.length ? lines.join("\n") : "no threads";
});

commands.open("/resume", async (context) => {
  const terminal = context.terminal;
  const threadId = context.signal.absolute?.[1];
  if (!threadId) return "usage: resume <thread-id>";

  for (const [, daemon] of lighthouse.daemons) {
    const thread = await daemon.entities.thread.findOne(
      { id: threadId },
      { populate: ["mode", "intent"] },
    );
    if (!thread) continue;

    daemon.entities.thread.resolve?.(thread);
    await openThread(terminal, daemon, thread);
    return `resumed ${thread.mode?.slug ?? threadId}`;
  }
  return `thread not found: ${threadId}`;
});

commands.open("/back", async (context) => {
  const terminal = context.terminal;
  if (terminal?.phase === "REPL") return "already in repl";
  terminal.reset();
  terminal.phase = "REPL";
});

commands.open("/status", async (context) => {
  const terminal = context.terminal;
  const identity = lighthouse.$identity.get();

  return [
    `user: ${identity?.username ?? "unknown"}`,
    `daemons: ${[...lighthouse.daemons.keys()].join(", ") || "none"}`,
    `phase: ${terminal?.phase ?? "n/a"}`,
    terminal?.mode ? `mode: ${terminal.mode.type}/${terminal.mode.slug}` : null,
  ].filter(Boolean).join("\n");
});
