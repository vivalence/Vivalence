import { basename } from "@std/path";
import { is, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { factory as mount } from "../../../instance/factory.js";
import { RECIPE } from "../../../ledger/prototype.js";
import { instance, recipe as voice, seek } from "../belt/index.js";

const SPACE = ["key", "describe", "group", "at"];
const STRATUM = (stratum) => stratum?.slice(0, 6) ?? null;

const split = async (ctx) => {
  const [first, second] = ctx.signal.body;
  if (first === undefined) return {};
  if (second !== undefined) {
    const found = await instance.locate(ctx, first);
    return found.mount ? { target: found.mount, filter: second } : found;
  }
  return await paladin.ledger.instances.resolve(first).then((held) => ({ target: held.mount }), () => ({ filter: first }));
};

async function effect(ctx) {
  const found = await split(ctx);
  if (found.error || found.aborted) return found;
  const { target, filter } = found;
  if (target) paladin.env.set("VIVA_INSTANCE_MOUNT", target, "flag");

  await mount(paladin.instance);
  const home = paladin.scope.instance.absolute;
  const slug = (await paladin.ledger.instances.lookup(home))?.slug ?? basename(home);

  const checked = paladin.check.environment(paladin.instance);
  const rows = filter ? seek(checked, SPACE, filter) : checked;

  const root = paladin.scope.mountpoint?.absolute ?? null;
  const seat = (held) => {
    const at = held?.absolute ?? held;
    if (!is.string(at)) return null;
    return root && at.startsWith(`${root}/`) ? at.slice(root.length + 1) : at;
  };
  const seats = (mountings) => Object.fromEntries(mountings.map((held) => [held.manifest?.slug, seat(held.mountpoint)]));
  const grounds = (daemons) =>
    Object.fromEntries(
      daemons.map((daemon) => [
        daemon.manifest?.slug,
        Object.fromEntries([
          ["mountpoint", seat(daemon.mountpoint)],
          ...(daemon.modes ?? [])
            .filter((entry) => entry?.mountpoint)
            .map((entry) => {
              const [, type, mode] = basename(seat(entry.mountpoint) ?? "").match(/^mode_([^_]+)_(.+)$/) ?? [];
              return [`${type}/${mode}`, seat(entry.mountpoint)];
            }),
        ]),
      ]),
    );

  return {
    mount: home,
    manifest: paladin.instance.manifest,
    runtime: paladin.instance.runtime?.manifest?.slug ?? null,
    ledger: paladin.instance.inherited.length ? paladin.scope.ledger.branch(RECIPE).absolute : null,
    inherited: voice.spoken(paladin.instance, paladin.instance.inherited),
    clients: paladin.instance.clients.map((client) => client.manifest?.slug),
    mountpoint: root,
    daemons: grounds(paladin.instance.daemons),
    services: seats(paladin.instance.services),
    env: rows.map(({ verdict, describe, group, required, at, ...row }) => ({ "!": required ? "!" : null, ...row, stratum: STRATUM(row.stratum) })),
    problems: rows
      .filter((row) => paladin.check.wrong.includes(row.verdict))
      .map((row) => ({ "!": "!", key: row.key, at: row.at, verdict: row.verdict, reason: row.reason })),
    faults: paladin.instance.faults,
    dormant: Object.fromEntries(
      paladin.instance.dormant.map(({ at, module, empty, why }) => [
        at,
        `${module ?? "nothing declared"}${empty.length ? ` — empty ${empty.join(", ")}` : ""}${why ? ` — ${why}` : ""}`,
      ]),
    ),
    lock: await paladin.ledger.lock(slug).read(),
  };
}

export const doctor = new Vector().open(
  {
    nature: "/instance/doctor",
    valence: "instance report card — manifest, services, locks, env table. Example: viva instance/doctor chess verdict:REQUIRED",
    input: v.object({
      target: v.string().desc("slug or path, defaults to the mounted instance. Example: chess").optional(),
      filter: v.string().desc("narrow the env table — a substring, or a field: group:keys · verdict:REQUIRED · key:NLP. Example: verdict:REQUIRED").optional(),
    }),
  },
  effect,
);
