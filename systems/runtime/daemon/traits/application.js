import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { App, Path } from "@vivalence/typology";

export const APPLICATION = async (mode, daemon) => {
  const declared = mode.module.application;
  const entry = declared.source
    ? null
    : new Path(resolve(mode.module.mount.dirname, String(declared.mount)));
  mode.application = declared.source
    ? new App({ source: declared.source, schema: declared.schema })
    : new App(entry, declared.schema);

  mode.application.buffer = (desc = {}) =>
    daemon.entities.buffer.create({
      mode: mode.entity.id,
      view: null,
      ...desc,
      data: mode.application.fill(desc),
    });

  let compiling = null;
  mode.application.compile = () => {
    compiling ??= (async () => {
      const store =
        `${daemon.mountpoint.absolute}/bundles/${mode.manifest.type}/${mode.manifest.slug}`;
      mode.application.view = await paladin.bundler(store).bundle(
        mode.application.source
          ? { kind: "svelte", source: mode.application.source }
          : { kind: "svelte", entry: entry.absolute },
      );
      return mode.application.view;
    })().finally(() => (compiling = null));
    return compiling;
  };

  return () => mode.application.compile();
};
