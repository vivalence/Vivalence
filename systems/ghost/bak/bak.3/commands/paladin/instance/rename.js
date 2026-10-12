import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { locate } from "../../../gestalten/belt/instance.js";

// the shelf is the ledger's own ground — a dir there follows its slug. a tapped dir is the
// operator's — rename moves the record key and leaves the files where they were.
async function effect(ctx) {
  const body = ctx.signal.body;
  const [target, next] = body.length === 1 ? [null, body[0]] : body;
  if (!next) return { error: "usage: /instance/rename [target] <next>" };

  if (target) {
    const found = await locate(ctx, target);
    if (!found.mount) return found;
    paladin.env.set("VIVA_INSTANCE_MOUNT", found.mount, "flag");
  }
  const mount = paladin.instance.home.absolute;
  const held = await paladin.ledger.instances.lookup(mount);
  if (!held) return { error: `instance: ${mount} not recorded — nothing to rename` };
  const prior = held.slug;

  if (await paladin.ledger.instances.read(next)) {
    return { error: `instance: '${next}' already held` };
  }
  const lock = await paladin.ledger.lock(prior).read();
  if (lock) {
    return { error: `'${prior}' is running (supervisor ${lock.pid}) — viva instance/stop first` };
  }

  await paladin.ledger.instances.rename(prior, next);
  const logs = paladin.scope.ledger.branch("logs").absolute;
  const history = await Deno.rename(`${logs}/${prior}`, `${logs}/${next}`).then(() => true, () => false);

  const shelved = mount === paladin.ledger.instances.shelf(prior).absolute;
  let dir = "kept — off-shelf (tapped)";
  if (shelved) {
    dir = paladin.ledger.instances.shelf(next).absolute;
    await Deno.rename(mount, dir);
    await paladin.ledger.instances.write(next, { mount: dir });

    const shells = paladin.scope.ledger.branch("sessions").absolute;
    if (await Deno.stat(shells).catch(() => null)) {
      for await (const entry of Deno.readDir(shells)) {
        if (!entry.name.endsWith(".json")) continue;
        const path = paladin.scope.ledger.branch(`sessions/${entry.name}`);
        const session = await paladin.read.json(path, null);
        if (session?.VIVA_INSTANCE_MOUNT === mount) {
          await paladin.state.json(path, { ...session, VIVA_INSTANCE_MOUNT: dir });
        }
      }
    }
  }

  return { renamed: { [prior]: next }, dir, logs: history, record: await paladin.ledger.instances.list() };
}

export const rename = new Vector().open(
  {
    nature: "/instance/rename",
    valence: "rename an instance — record key, logs, the sessions that selected it, and the dir when it lives on the shelf (a tapped dir stays); refuses while running. Example: viva instance/rename chess scacchi",
    schema: v.object({
      target: v.string().desc("slug or path, defaults to the mounted instance. Example: chess").optional(),
      next: v.string().desc("the new slug. Example: scacchi"),
    }),
  },
  effect,
);
