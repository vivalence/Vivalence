import paladin from "@vivalence/paladin";
import { BufferControl, Confirm } from "@vivalence/sheets";
import { locate } from "./target.js";

// the shelf is the ledger's own ground — a dir there dies with its record. a tapped dir is the
// operator's — delete unrecords it and leaves the files where they were.
export async function remove(ctx) {
  const [target] = ctx.signal.params ?? [];
  if (target) {
    const found = await locate(ctx, target);
    if (!found.mount) return (ctx.effect = found);
    paladin.env.set("VIVA_INSTANCE_MOUNT", found.mount, "flag");
  }
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) return (ctx.effect = { error: `instance: ${mount} not recorded — nothing to delete` });
  const { slug } = held;

  const lock = await paladin.ledger.lock(slug).read();
  if (lock) {
    const running = lock.processes.map((entry) => entry.process).join(" ");
    return (ctx.effect = { error: `'${slug}' is running (supervisor ${lock.pid}: ${running}) — viva instance/stop first` });
  }

  const shelved = mount === paladin.ledger.instances.shelf(slug).absolute;
  const logs = paladin.scope.ledger.branch(`logs/${slug}`).absolute;
  const history = Boolean(await Deno.stat(logs).catch(() => null));

  const shells = paladin.scope.ledger.branch("sessions").absolute;
  const sessions = [];
  if (await Deno.stat(shells).catch(() => null)) {
    for await (const entry of Deno.readDir(shells)) {
      if (!entry.name.endsWith(".json")) continue;
      const payload = await paladin.read.json(paladin.scope.ledger.branch(`sessions/${entry.name}`), null);
      if (payload?.VIVA_INSTANCE_MOUNT === mount) sessions.push(entry.name);
    }
  }

  const plan = {
    slug,
    mount,
    files: shelved ? "removed" : "kept — off-shelf (tapped)",
    logs: history,
    sessions: sessions.map((name) => Number(name.slice(0, -".json".length))),
  };

  if (ctx.signal.flags?.force !== true) {
    if (!ctx.interactive) {
      throw new Error(`instance/delete ${slug}: needs a terminal to confirm, or --force`);
    }
    const buffer = new BufferControl();
    const label = shelved
      ? `delete ${slug} — rm -rf ${mount}, ${plan.sessions.length} sessions?`
      : `unrecord ${slug} — files at ${mount} stay, ${plan.sessions.length} sessions?`;
    const choice = await ctx.view.scroll.render(
      { label, defaultChoice: false, onSubmit: (value) => buffer.release(value) },
      buffer,
      Confirm,
    );
    if (!choice) return (ctx.effect = { aborted: true, ...plan });
  }

  if (history) await Deno.remove(logs, { recursive: true });
  for (const name of sessions) await paladin.state.remove(paladin.scope.ledger.branch(`sessions/${name}`));
  if (shelved) await Deno.remove(mount, { recursive: true });
  await paladin.ledger.instances.remove(slug);

  ctx.effect = { deleted: slug, ...plan, record: await paladin.ledger.instances.list() };
}
