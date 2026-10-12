import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { App, Bundle } from "@vivalence/typology";

export const APPLICATION = async (mode, context) => {
  const declared = mode.module.application;
  const bundler = paladin.bundler(mode.bundles.absolute);
  mode.application = new App(declared.sources, declared.schema);

  mode.application.buffer = (desc = {}) =>
    context.entities.buffer.create({
      mode: mode.entity.id,
      bundle: null,
      ...desc,
      data: mode.application.fill(desc),
    });

  let compiling = null;
  mode.application.compile = () => {
    compiling ??= Promise.all(
      mode.application.sources.map(({ mime, mount, source }) =>
        bundler.bundle(source ? { mime, source } : { mime, entry: resolve(mode.module.source.dirname, mount) })),
    ).then((bundles) => (mode.application.bundle = Bundle.merge(...bundles)))
      .finally(() => (compiling = null));
    return compiling;
  };

  return () => mode.application.compile();
};
