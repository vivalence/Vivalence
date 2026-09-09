import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { App, Path } from "@vivalence/typology";

export const APPLICATION = async (mode, daemon) => {
  const declared = mode.module.app;
  const entry = declared.source
    ? null
    : new Path(resolve(mode.module.mount.dirname, String(declared.mount)));
  mode.app = declared.source
    ? new App({ source: declared.source, schema: declared.schema })
    : new App(entry, declared.schema);

  mode.app.buffer = (desc = {}) =>
    daemon.entities.buffer.create({
      mode: mode.entity.id,
      view: null,
      ...desc,
      data: mode.app.fill(desc),
    });

  let compiling = null;
  mode.app.compile = () => {
    compiling ??= (async () => {
      const store =
        `${daemon.mountpoint.absolute}/bundles/${mode.manifest.type}/${mode.manifest.slug}`;
      mode.app.view = await paladin.bundler(store).bundle(
        mode.app.source
          ? { kind: "svelte", source: mode.app.source }
          : { kind: "svelte", entry: entry.absolute },
      );
      return mode.app.view;
    })().finally(() => (compiling = null));
    return compiling;
  };

  return () => mode.app.compile();
};
