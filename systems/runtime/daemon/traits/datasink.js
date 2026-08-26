import { fn, shard, project, Datasink } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { stamp } from "./dataset.js";

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
    const chosen = input.all || !dirty.size ? null : [...dirty];
    dirty.clear();
    const report = { drained: [], written: 0, orphans: {} };

    for (const type of datasink.types) {
      const sinks = datasink.of(type).filter((sink) => !chosen || chosen.includes(sink));
      if (!sinks.length) continue;
      const repo = daemon.entities[type];
      if (!repo) continue;

      const relations = Object.keys(meta[type]?.properties ?? {});
      const claimed = new Set();

      for (const sink of sinks) {
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

      if (sinks.length === datasink.of(type).length) {
        const total = await repo.count({});
        report.orphans[type] = Math.max(0, total - claimed.size);
      }
      report.drained.push(type);
    }

    if (report.written && mode.entity?.id && daemon.entities.mode) {
      mode.entity.installed = await stamp(mode);
      await daemon.entities.mode.nativeUpdate({ id: mode.entity.id }, { installed: mode.entity.installed });
    }

    return report;
  };

  const once = (input) => (flight ??= drain(input).finally(() => (flight = null)));
  const settle = fn.debounce(() => once({}), DEBOUNCE);

  datasink.drain = once;

  for (const type of datasink.types)
    for (const op of ["create", "update", "delete"])
      daemon.twitch.open(`/after/${type}/${op}`, (ctx) => {
        if (!armed) return;
        const entity = ctx?.input?.entity;
        const sinks = datasink.of(type);
        const claimed = entity
          ? sinks.filter((sink) => sink.match?.(entity, { daemon, mode }) === true)
          : [];
        for (const sink of claimed.length ? claimed : sinks) dirty.add(sink);
        settle();
      });

  return {
    finalize: async () => {
      armed = true;
    },
    terminate: () => {
      armed = false;
      settle.cancel();
    },
  };
};
