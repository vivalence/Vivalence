import paladin from "@vivalence/paladin";
import { App, Path } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/runtime";

export const APPLICATION = async (mode, daemon) => {
  const declared = mode.module.app;
  const entry = declared.source ? null : new Path(mode.module.mount.dirname + declared.mount.nature);
  mode.app = declared.source
    ? new App({ source: declared.source, schema: declared.schema })
    : new App(entry, declared.schema);

  mode.app.buffer = async (desc = {}) => {
    const buffer = daemon.entities.em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.app.fill(desc),
      view: null,
      index: desc.index ?? 0,
    });
    if (desc.thread) {
      const thread = await daemon.entities.thread.findOne(desc.thread);
      buffer.thread = thread;
      buffer.index = thread.counter++;
    }
    if (desc.literals) buffer.literals.add(await daemon.entities.literal.findByIdentifiers(desc.literals));
    if (desc.symbols) buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(desc.symbols));
    return buffer;
  };

  return async () => {
    const store = `${daemon.mountpoint.absolute}/bundles/${mode.type}/${mode.slug}`;
    mode.app.view = await paladin.bundler(store).bundle(
      mode.app.source
        ? { kind: "svelte", source: mode.app.source }
        : { kind: "svelte", entry: entry.absolute },
    );
  };
};
