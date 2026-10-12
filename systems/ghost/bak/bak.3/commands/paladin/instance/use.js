import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { lens, pick } from "../../../gestalten/belt/index.js";
import { locate, register } from "../../../gestalten/belt/instance.js";

async function effect(ctx) {
  const token = ctx.signal.body[0];

  const report = () => ({
    instance: paladin.env.get("VIVA_INSTANCE_MOUNT"),
    stratum: paladin.env.provenance("VIVA_INSTANCE_MOUNT"),
    mount: paladin.scope.instance?.absolute ?? null,
  });

  let mount = null;
  if (token) {
    const found = await locate(ctx, token);
    if (!found.mount) return found;
    mount = found.mount;
  } else {
    const instances = await lens.instances();
    // bare `use` where no prompt can happen (a pipe, --json, an empty ledger) stays the report.
    if (!ctx.view.interactive || !instances.rows.length) return report();
    const chosen = await pick(ctx, instances);
    if (chosen?.aborted) return { aborted: true };
    if (!chosen) return report();
    mount = chosen.row.mount;
  }

  const shell = Deno.env.get("VIVA_PROCESS_ID");
  const ledger = ctx.signal.flags.ledger === true;
  if (!ledger && !shell) {
    throw new Error(
      "session selection needs VIVA_PROCESS_ID — run viva ledger/install (writes the shell line) or pass --ledger",
    );
  }

  const record = paladin.scope.ledger.branch(ledger ? ".env" : `sessions/${shell}.json`);
  const tag = ledger ? "ledger" : "session";

  // the ledger's .env is authored — upsert one line. a session record is machine state — JSON.
  if (ledger) await paladin.state.env(record, { VIVA_INSTANCE_MOUNT: mount });
  else {
    const held = (await paladin.read.json(record, null)) ?? {};
    await paladin.state.json(record, { ...held, VIVA_INSTANCE_MOUNT: mount });
  }
  paladin.env.set("VIVA_INSTANCE_MOUNT", mount, tag);

  const stratum = paladin.env.provenance("VIVA_INSTANCE_MOUNT");
  let note = null;
  if (stratum === tag) {
    try {
      await register();
    } catch (error) {
      note = error.message;
    }
  }

  const rest = ctx.signal.body.slice(1);
  if (rest.length) return ctx.call([`instance/${rest[0]}`, ...rest.slice(1)]);

  return {
    selected: mount,
    stratum,
    mount: paladin.scope.instance.absolute,
    record: record.absolute,
    ...(note ? { note } : {}),
  };
}

export const use = new Vector().open(
  {
    nature: "/instance/use",
    valence: "select this shell's instance (the VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an ambiguous or missing one opens the picker; bare use in a pipe prints current + provenance; trailing segments chain under /instance. Example: viva instance/use chess up",
    schema: v.object({
      token: v.string().desc("slug | /abs | source path — preset for the picker. Example: chess").optional(),
      ledger: v.boolean().desc("write the machine default (<ledger>/.env) instead of this shell's session").group("flags").optional(),
    }),
  },
  effect,
);
