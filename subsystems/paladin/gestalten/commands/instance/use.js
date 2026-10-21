import { v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { instance, lens, pick } from "../belt/index.js";

const report = () => ({
  instance: paladin.env.get("VIVA_INSTANCE_MOUNT"),
  stratum: paladin.env.provenance("VIVA_INSTANCE_MOUNT"),
  mount: paladin.scope.instance?.absolute ?? null,
});

async function chosen(ctx, token) {
  if (token) return await instance.locate(ctx, token);
  const instances = await lens.instances();
  if (!ctx.hold || !instances.rows.length) return { report: report() };
  const picked = await pick(ctx, instances);
  if (picked?.aborted) return { aborted: true };
  if (!picked) return { report: report() };
  return { mount: picked.row.mount };
}

async function effect(ctx) {
  const found = await chosen(ctx, ctx.signal.body[0]);
  if (found.report) return found.report;
  if (!found.mount) return found;
  const { mount } = found;

  const shell = Deno.env.get("VIVA_PROCESS_ID");
  const ledger = ctx.signal.flags.ledger === true;
  if (!ledger && !shell) throw new Error("session selection needs VIVA_PROCESS_ID — run viva ledger/install (writes the shell config) or pass --ledger");

  const record = paladin.scope.ledger.branch(ledger ? ".env" : `sessions/${shell}.json`);
  const tag = ledger ? "ledger" : "session";

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
      await instance.register();
    } catch (error) {
      note = error.message;
    }
  }

  const rest = ctx.signal.body.slice(1);
  if (rest.length) return ctx.call([`instance/${rest[0]}`, ...rest.slice(1)]);

  return { selected: mount, stratum, mount: paladin.scope.instance.absolute, record: record.absolute, ...(note ? { note } : {}) };
}

export const use = new Vector().open(
  {
    nature: "/instance/use",
    valence: "select this shell's instance (the VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an ambiguous or missing one opens the picker; bare use in a pipe prints current + provenance; trailing segments chain under /instance. Example: viva instance/use chess up",
    input: v.object({
      token: v.string().desc("slug | /abs | source path — preset for the picker. Example: chess").optional(),
      ledger: v.boolean().desc("write the machine default (<ledger>/.env) instead of this shell's session").group("flags").optional(),
    }),
  },
  effect,
);
