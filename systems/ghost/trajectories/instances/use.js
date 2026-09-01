import paladin from "@vivalence/paladin";
import { lens, pick } from "../../belt/index.js";
import { locate, register } from "../instance/target.js";

export async function use(ctx) {
  const input = ctx.signal.params?.[0];

  const report = () => (ctx.effect = {
    instance: paladin.env.get("VIVA_INSTANCE_MOUNT"),
    stratum: paladin.env.provenance("VIVA_INSTANCE_MOUNT"),
    mount: paladin.scope.instance?.absolute ?? null,
  });

  let reference = null;
  if (input) {
    const found = await locate(ctx, input);
    if (!found.mount) return (ctx.effect = found);
    reference = found.mount;
  } else {
    const instances = await lens.instances();
    // bare `use` where no prompt can happen (a pipe, --json, an empty ledger) stays the report.
    if (!ctx.interactive || !instances.rows.length) return report();
    const chosen = await pick(ctx, instances);
    if (chosen?.aborted) return (ctx.effect = { aborted: true });
    if (!chosen) return report();
    reference = chosen.row.mount;
  }

  const shell = Deno.env.get("VIVA_PROCESS_ID");
  const ledger = ctx.signal.flags?.ledger === true;
  if (!ledger && !shell) {
    throw new Error(
      "session selection needs VIVA_PROCESS_ID — run viva ledger init (writes the shell line) or pass --ledger",
    );
  }

  const record = paladin.scope.ledger.branch(ledger ? ".env" : `sessions/${shell}.json`);
  const tag = ledger ? "ledger" : "session";

  // the ledger's .env is authored — upsert one line. a session record is machine state — JSON.
  if (ledger) await paladin.state.env(record, { VIVA_INSTANCE_MOUNT: reference });
  else {
    const held = (await paladin.read.json(record, null)) ?? {};
    await paladin.state.json(record, { ...held, VIVA_INSTANCE_MOUNT: reference });
  }
  paladin.env.set("VIVA_INSTANCE_MOUNT", reference, tag);

  const stratum = paladin.env.provenance("VIVA_INSTANCE_MOUNT");
  let note = null;
  if (stratum === tag) {
    try {
      await register();
    } catch (error) {
      note = error.message;
    }
  }

  const rest = ctx.signal.params.slice(1);
  if (rest.length) return (ctx.effect = await ctx.call([`instance/${rest[0]}`, ...rest.slice(1)]));

  ctx.effect = {
    selected: reference,
    stratum,
    mount: paladin.scope.instance.absolute,
    record: record.absolute,
    ...(note ? { note } : {}),
  };
}
