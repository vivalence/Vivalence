import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime, Path } from "@vivalence/typology";

export const VIEWABLE = async (mode, context) => {
  if (mode.module.buffer) {
    mode.buffer = Object.assign(
      ({ data = {}, ...desc } = {}) =>
        context.entities.buffer.create({
          mode: mode.entity.id,
          mime: mode.buffer.mime,
          ...desc,
          data: mode.module.buffer.fill({ ...desc, data }).data,
        }),
      { mime: mime.viva(context.reference.branch(`/mode/${mode.manifest.type}/${mode.manifest.slug}`)) },
    );
  }
  if (!mode.module.views) return;
  const bundler = paladin.bundler(new Path(mode.mountpoint).absolute);
  mode.views = [];
  for (const declared of mode.module.views) {
    mode.views.push(
      await context.entities.view.bundle(
        { mode: mode.entity.id, slug: declared.slug, mime: declared.mime, traits: declared.traits, entry: join(mode.module.source.dirname, declared.mount) },
        { bundler },
      ),
    );
  }
};
