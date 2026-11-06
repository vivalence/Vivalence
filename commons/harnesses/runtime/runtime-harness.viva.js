import { Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { gestalten } from "@vivalence/runtime";

export const manifest = {
  type: "harness",
  slug: "runtime",
  name: "Runtime Harness",
  description: "default runtime harness",
  version: "0.3.0",
  traits: ["HARNESSED", "AGENTIC", "TOOLING", "PRIMER"], //, "APPLICATION"],
};

const read = (file) => () => paladin.read.text(new URL(file, import.meta.url));
const cell = (value) => (/[",\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? ""));
const csv = (rows) => rows.map((row) => row.map(cell).join(",")).join("\n");
const runtimeHost = (ctx) => (ctx.reference.absolute.startsWith("/runtime/") ? ctx.reference.absolute : "/runtime");

export const harness = new Vector();

// identity - who you are and how to behave
// world - where you are, whats around you, and where you can go
// role - why you exist and what youre supposed to do
// skills - how to do things to the world

export const primer = new Vector()
  .open("identity", read("identity.md"))
  .open("world", read("world.md"))
  .open("runtime", (ctx) =>
    [
      "Runtime:",
      `mode ${ctx.mode.manifest.type}/${ctx.mode.manifest.slug} · ${ctx.mode.manifest.name ?? ctx.mode.manifest.slug} · traits ${ctx.mode.manifest.traits.join(" ") || "none"}`,
      `thread ${ctx.thread.id} · ${ctx.thread.trait?.LABELED?.name ?? "unlabeled"} · phase ${ctx.thread.phase} · traits ${ctx.thread.traits.join(" ") || "none"} · buffers minted ${ctx.thread.counter} · user ${ctx.thread.user.id}`,
      `machine os ${Deno.build.os} · cwd ${ctx.mountpoint.absolute} · date ${new Date().toLocaleDateString("sv")} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    ].join("\n"))
  .open("daemons", async (ctx) => {
    const daemons = await ctx.entities.daemon.find({}, { orderBy: { slug: "asc" } });
    const [terminals, threads] = await Promise.all([ctx.entities.terminal.count({}), ctx.entities.thread.count({})]);
    return csv([
      ["host", "slug", "name", "version", "icon", "description", "consumes", "statics"],
      [runtimeHost(ctx), "", "", "", "", `user ${ctx.user.slug} · terminals ${terminals} · threads ${threads}`, "", ""],
      ...daemons.map((daemon) => [
        `/daemon/${daemon.slug}`,
        daemon.slug,
        daemon.mask.manifest?.name,
        daemon.mask.manifest?.version,
        daemon.mask.manifest?.icon?.emoji,
        daemon.mask.manifest?.description,
        Object.entries(daemon.mask.consume ?? {}).map(([name, service]) => `${name}→${service.module}`).join(" "),
        daemon.mask.statics ? JSON.stringify(daemon.mask.statics) : "",
      ]),
    ]);
  })
  .open("modes", async (ctx) => {
    const [daemons, modes] = await Promise.all([
      ctx.entities.daemon.find({}),
      ctx.entities.mode.find({}, { populate: ["daemon"], orderBy: { daemon: "asc", type: "asc", slug: "asc" } }),
    ]);
    const modules = new Map(daemons.map((daemon) => [daemon.slug, daemon.mask.modes ?? []]));
    return csv([
      ["host", "path", "module", "name", "traits"],
      ...modes.map((mode) => [
        mode.daemon ? `/daemon/${mode.daemon.slug}` : runtimeHost(ctx),
        `/mode/${mode.type}/${mode.slug}`,
        (modules.get(mode.daemon?.slug) ?? []).find((id) => id.endsWith(`/${mode.type}/${mode.slug}`)) ?? "",
        mode.name ?? mode.slug,
        mode.traits.join(" "),
      ]),
    ]);
  })
  .open("threads", async (ctx) => {
    const since = new Date(Date.now() - 2 * 86_400_000);
    const threads = await ctx.entities.thread.find({ updatedAt: { $gte: since } }, { orderBy: { updatedAt: "desc" } });
    const counted = await Promise.all(threads.map(async (thread) => [thread, await ctx.entities.turn.count({ thread: thread.id }), await ctx.entities.buffer.count({ thread: thread.id })]));
    return [
      "Threads — this user's, the last two days (id · created · updated · turns · buffers):",
      ...counted.map(([thread, turns, buffers]) => `${thread.id} · ${thread.createdAt.toISOString()} · ${thread.updatedAt.toISOString()} · turns ${turns} · buffers ${buffers}`),
    ].join("\n");
  })
  .graft(gestalten.primer.entities);

export const tools = new Vector().graft(
  gestalten.tools.entity,
  gestalten.tools.buffer,
  gestalten.tools.thread,
  gestalten.tools.mode,
);
