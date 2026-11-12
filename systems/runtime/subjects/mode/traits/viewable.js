import { mime } from "@vivalence/typology";

const stem = (type) => type.replace(`${mime.VENDOR}.`, "").replace(/\+javascript$/, "");

export const VIEWABLE = async (mode, modeDie) => {
  if (mode.module.buffer) {
    mode.buffer = Object.assign(
      ({ data = {}, ...desc } = {}) =>
        modeDie.entities.buffer.create({
          mode: mode.entity.id,
          mime: mode.buffer.mime,
          ...desc,
          data: mode.module.buffer.fill({ ...desc, data }).data,
        }),
      {
        mime: mime.viva(
          modeDie.reference.branch(`/mode/${mode.manifest.type}/${mode.manifest.slug}`),
        ),
      },
    );
  }
  if (!mode.module.views) return;
  mode.views = [];
  for (const declared of mode.module.views) {
    mode.views.push(
      await modeDie.entities.view.ensure({
        mode: mode.entity.id,
        slug: declared.slug,
        mime: declared.mime,
        mount: declared.mount,
        traits: declared.traits ?? ["FRAME"],
        entry: `bundle/${declared.slug}.${stem(declared.mime)}.mjs`,
      }),
    );
  }
  await modeDie.entities.view.em.flush();
};
