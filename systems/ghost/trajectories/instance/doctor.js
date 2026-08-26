import paladin from "@vivalence/paladin";
import { basename } from "@std/path";
import { search } from "@vivalence/sheets";
import { path } from "../../belt/index.js";

// the picker's own fold, so `nlp` is a substring and `verdict:REQUIRED` is a facet — one grammar
// for narrowing, wherever a set is rendered.
// the free-text space is what you'd type looking for a variable. verdict stays reachable as an
// explicit facet — search.js builds facet fields off the row, not off the haystack.
const WRONG = ["UNDOCUMENTED", "REQUIRED"];
const SPACE = ["key", "describe", "group", "at"];
const FACETS = ["group", "verdict", "key"];

const narrow = (rows, query) => {
  if (!query) return rows;
  const held = search.init({ rows, keys: SPACE, facets: FACETS });
  return search.seek(held, query).matches.map((at) => rows[at]);
};

// `doctor <target> <filter>` is unambiguous; `doctor <one>` is not. one param names the instance
// only if the ledger or the filesystem knows it — otherwise it narrows the instance you are on.
const split = async (params = []) => {
  const [first, second] = params;
  if (second !== undefined) return { target: first, filter: second };
  if (first === undefined) return {};
  if (await paladin.ledger.instances.read(first)) return { target: first };
  if (await Deno.stat(path.instance(first)).catch(() => null)) return { target: first };
  return { filter: first };
};

export async function doctor(ctx) {
  const { target, filter } = await split(ctx.signal.params);
  if (target) {
    paladin.env.set("VIVA_INSTANCE_MOUNT", path.instance(target), "flag");
  }

  if (!paladin.scope.instance) {
    return (ctx.effect = { error: "no instance — set VIVA_INSTANCE_MOUNT or pass a slug/path" });
  }

  await paladin.instance.mount();
  const mount = paladin.scope.instance.absolute;
  const instance = basename(mount);

  const rows = narrow(paladin.check.environment(paladin.instance), filter);

  ctx.effect = {
    mount,
    manifest: paladin.instance.manifest,
    daemons: (paladin.instance.daemons ?? []).map((daemon) => daemon.slug ?? daemon.manifest?.slug),
    services: (paladin.instance.services ?? []).map((service) => service.slug ?? service.manifest?.slug),
    clients: Object.keys(paladin.instance.clients ?? {}),
    runtime: Object.keys(paladin.instance.runtime ?? {}),
    mountpoint: paladin.scope.mountpoint?.absolute ?? null,
    vars: paladin.env.strata.get("instance") ?? {},
    // a verdict column reading `ok` twenty times is noise. one marker, first, and because Table
    // drops a column that is null in every row it disappears entirely when nothing is wrong.
    env: rows.map(({ verdict, ...row }) => ({ "!": WRONG.includes(verdict) ? "!" : null, ...row })),
    // just the finding — the detail is already in the row above, marked.
    problems: rows
      .filter((row) => WRONG.includes(row.verdict))
      .map((row) => ({ "!": "!", key: row.key, at: row.at, verdict: row.verdict })),
    locks: await paladin.ledger.locks(instance),
  };
}
