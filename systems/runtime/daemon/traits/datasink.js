import { fn, shard, project, Datasink } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const DATASPACE = new Set(["symbol", "literal"]);
const DEBOUNCE = 1500;

export const DATASINK = (mode, daemon) => {
  const datasink = new Datasink(mode.module.datasink ?? {});
  mode.datasink = datasink;

  const meta = shard.datamap.strip(daemon.datamap.introspect());
  for (const type of datasink.types) {
    const scoped = Object.values(meta[type]?.properties ?? {}).some((relation) => relation.target === "user");
    if (!DATASPACE.has(type) || scoped)
      throw new Error(`[DATASINK] ${mode.type}/${mode.slug} declares non-dataspace entity "${type}"`);
    if (!daemon.entities[type])
      console.warn(`[DATASINK] ${mode.type}/${mode.slug} declares unknown entity "${type}"`);
  }

  const dirty = new Set();
  let armed = false;
  let flight = null;

  const drain = async (input = {}) => {
    const types = input.all || !dirty.size ? datasink.types : [...dirty];
    const report = { drained: [], written: 0, orphans: {} };

    for (const type of types) {
      dirty.delete(type);
      const repo = daemon.entities[type];
      if (!repo) continue;

      const relations = Object.keys(meta[type]?.properties ?? {});
      const claimed = new Set();

      for (const sink of datasink.of(type)) {
        const columns = sink.target.keep.filter((name) => meta[type]?.columns?.[name]);
        const found = await repo.find(sink.where ?? {}, { populate: relations });
        const rows = found
          .map(project.row(relations, [...columns, ...relations]))
          .filter((row) => sink.match?.(row, { daemon, mode }) ?? true)
          .map(sink.shape ?? project.lean(relations))
          .filter((row) => row != null);

        for (const [target, slice] of Datasink.strata(rows, sink.target)) {
          for (const row of slice) claimed.add(row.slug);
          const path = `${mode.module.mount.dirname}/${target}`;
          if (await paladin.state.scribe(path, Datasink.canonical(slice, sink.target.codec))) report.written++;
        }
      }

      const total = await repo.count({});
      report.orphans[type] = Math.max(0, total - claimed.size);
      report.drained.push(type);
    }

    return report;
  };

  const once = (input) => (flight ??= drain(input).finally(() => (flight = null)));
  const settle = fn.debounce(() => once({}), DEBOUNCE);

  datasink.drain = once;

  for (const type of datasink.types)
    for (const op of ["create", "update", "delete"])
      daemon.twitch.open(`/after/${type}/${op}`, () => {
        if (!armed) return;
        dirty.add(type);
        settle();
      });

  return {
    finalize: () => {
      armed = true;
    },
    terminate: () => {
      armed = false;
      settle.cancel();
    },
  };
};
