import paladin, { lifecycle } from "@vivalence/paladin";
import { basename } from "@std/path";
import { is } from "@vivalence/typology";
import { search } from "@vivalence/sheets";
import { locate } from "./target.js";
import { recipe as voice } from "../../belt/index.js";

// the picker's own fold, so `nlp` is a substring and `verdict:REQUIRED` is a facet — one grammar
// for narrowing, wherever a set is rendered.
// the free-text space is what you'd type looking for a variable. verdict stays reachable as an
// explicit facet — search.js builds facet fields off the row, not off the haystack.
const WRONG = paladin.check.wrong;
const SPACE = ["key", "describe", "group", "at"];
const FACETS = ["group", "verdict", "key"];
const STRATUM = (stratum) => stratum?.slice(0, 6) ?? null;

const narrow = (rows, query) => {
  if (!query) return rows;
  const held = search.init({ rows, keys: SPACE, facets: FACETS });
  return search.seek(held, query).matches.map((at) => rows[at]);
};

// `doctor <target> <filter>` is unambiguous; `doctor <one>` is not. one param names the instance
// only if the record resolves it — otherwise it narrows the instance you are on.
const split = async (ctx) => {
  const [first, second] = ctx.signal.params ?? [];
  if (first === undefined) return {};
  if (second !== undefined) {
    const found = await locate(ctx, first);
    return found.mount ? { target: found.mount, filter: second } : found;
  }
  return await paladin.ledger.instances
    .resolve(first)
    .then((held) => ({ target: held.mount }), () => ({ filter: first }));
};

export async function doctor(ctx) {
  const found = await split(ctx);
  if (found.error || found.aborted) return (ctx.effect = found);
  const { target, filter } = found;
  if (target) paladin.env.set("VIVA_INSTANCE_MOUNT", target, "flag");

  await lifecycle.mount(paladin.instance);
  const mount = paladin.scope.instance.absolute;
  const instance = (await paladin.ledger.instances.lookup(mount))?.slug ?? basename(mount);

  const rows = narrow(paladin.check.environment(paladin.instance), filter);

  // seats relative to the instance mountpoint; a seat re-rooted elsewhere stays absolute
  const root = paladin.scope.mountpoint?.absolute ?? null;
  const seat = (held) => {
    const at = held?.absolute ?? held;
    if (!is.string(at)) return null;
    return root && at.startsWith(`${root}/`) ? at.slice(root.length + 1) : at;
  };
  const seats = (mountings) =>
    Object.fromEntries(mountings.map((held) => [held.manifest?.slug, seat(held.mountpoint)]));
  // a daemon's row: its own seat, then each mode's seat keyed type/slug — the mode_ prefix is the dir's, not the key's
  const grounds = (daemons) =>
    Object.fromEntries(
      daemons.map((daemon) => [
        daemon.manifest?.slug,
        Object.fromEntries([
          ["mountpoint", seat(daemon.mountpoint)],
          ...(daemon.kernel ?? [])
            .filter((entry) => entry?.mountpoint)
            .map((entry) => {
              const [, type, slug] = basename(seat(entry.mountpoint) ?? "").match(/^mode_([^_]+)_(.+)$/) ?? [];
              return [`${type}/${slug}`, seat(entry.mountpoint)];
            }),
        ]),
      ]),
    );

  ctx.effect = {
    mount,
    manifest: paladin.instance.manifest,
    runtime: paladin.instance.runtime?.manifest?.slug ?? null,
    // the ledger's word in this instance: which slots it supplied and what they say; the file that said it
    ledger: paladin.instance.inherited.length ? paladin.scope.ledger.branch("ledger.viva.js").absolute : null,
    inherited: voice.spoken(paladin.instance, paladin.instance.inherited),
    clients: paladin.instance.clients.map((client) => client.manifest?.slug),
    mountpoint: root,
    daemons: grounds(paladin.instance.daemons),
    services: seats(paladin.instance.services),
    env: rows.map(({ verdict, describe, group, required, at, ...row }) => ({
      "!": required ? "!" : null,
      ...row,
      stratum: STRATUM(row.stratum),
    })),
    // just the finding — the detail is already in the row above, marked.
    problems: rows
      .filter((row) => WRONG.includes(row.verdict))
      .map((row) => ({ "!": "!", key: row.key, at: row.at, verdict: row.verdict, reason: row.reason })),
    faults: paladin.instance.faults,
    // one line each: where, what lived there, which secret was blank
    dormant: Object.fromEntries(
      paladin.instance.dormant.map(({ at, module, empty, why }) => [
        at,
        `${module ?? "nothing declared"}${empty.length ? ` — empty ${empty.join(", ")}` : ""}${why ? ` — ${why}` : ""}`,
      ]),
    ),
    lock: await paladin.ledger.lock(instance).read(),
  };
}
