import paladin, { lifecycle } from "@vivalence/paladin";
import { basename } from "@std/path";
import { search } from "@vivalence/sheets";
import { locate } from "./target.js";

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

  ctx.effect = {
    mount,
    manifest: paladin.instance.manifest,
    runtime: paladin.instance.runtime?.manifest?.slug ?? null,
    daemons: paladin.instance.daemons.map((daemon) => daemon.manifest?.slug),
    services: paladin.instance.services.map((service) => service.manifest?.slug),
    clients: paladin.instance.clients.map((client) => client.manifest?.slug),
    mountpoint: paladin.scope.mountpoint?.absolute ?? null,
    vars: paladin.env.strata.get("instance") ?? {},
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
    dormant: paladin.instance.dormant,
    lock: await paladin.ledger.lock(instance).read(),
  };
}
