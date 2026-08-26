import paladin from "@vivalence/paladin";

export async function rename(ctx) {
  const [prior, next] = ctx.signal.params ?? [];
  if (!prior || !next) {
    return (ctx.effect = { error: "usage: /instances/rename <old> <new>" });
  }
  if (!(await paladin.ledger.instances.read(prior))) {
    return (ctx.effect = { error: `instances: no record '${prior}'` });
  }
  if (await paladin.ledger.instances.read(next)) {
    return (ctx.effect = { error: `instances: '${next}' already held` });
  }

  const locks = paladin.scope.ledger.branch("locks").absolute;
  const prefix = `${prior}_`;
  const carried = [];
  for await (const entry of Deno.readDir(locks)) {
    if (!entry.name.startsWith(prefix) || !entry.name.endsWith(".lock")) continue;
    const process = entry.name.slice(prefix.length, -".lock".length);
    if (await paladin.ledger.lock(prior, process).alive()) {
      return (ctx.effect = { error: `'${prior}' is running (${process}) — stop it first` });
    }
    carried.push(entry.name);
  }

  await paladin.ledger.instances.rename(prior, next);

  for (const name of carried) {
    await Deno.rename(`${locks}/${name}`, `${locks}/${next}_${name.slice(prefix.length)}`);
  }
  const logs = paladin.scope.ledger.branch("logs").absolute;
  const history = await Deno.rename(`${logs}/${prior}`, `${logs}/${next}`).then(() => true, () => false);

  ctx.effect = {
    renamed: { [prior]: next },
    locks: carried.length,
    logs: history,
    record: await paladin.ledger.instances.list(),
  };
}
