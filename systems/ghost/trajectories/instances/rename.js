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

  const lock = await paladin.ledger.lock(prior).read();
  if (lock) {
    return (ctx.effect = { error: `'${prior}' is running (supervisor ${lock.pid}) — stop it first` });
  }

  await paladin.ledger.instances.rename(prior, next);
  const logs = paladin.scope.ledger.branch("logs").absolute;
  const history = await Deno.rename(`${logs}/${prior}`, `${logs}/${next}`).then(() => true, () => false);

  ctx.effect = {
    renamed: { [prior]: next },
    logs: history,
    record: await paladin.ledger.instances.list(),
  };
}
