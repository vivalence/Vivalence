import paladin from "@vivalence/paladin";
import { App, Path } from "@vivalence/typology";
import { BufferEntity } from "@vivalence/typology/entities";

export const APPLICATION = async (mode, daemon) => {
  const entry = new Path(mode.module.mount.dirname + mode.module.app.mount.nature);
  mode.app = new App(entry, mode.module.app.schema);

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
    const store = `${daemon.mountpoint.absolute}/${mode.type}/${mode.slug}`;
    mode.app.view = await paladin.bundler(store).bundle({ kind: "svelte", entry: entry.absolute });
  };
};
