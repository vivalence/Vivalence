import { stagger } from "../../../gestalten/belt/index.js";
import { stamp } from "../traits/dataset.js";

export const traits = async (modeDie) => {
  await modeDie.datamap.shard.scope(async () => {
    modeDie.entities.em.setFilterParams("daemon", { daemon: modeDie.mode.daemon });
    modeDie.entities.em.setFilterParams("mode", { mode: modeDie.mode.id });
    const installed = await stamp(modeDie.mode);

    if (
      typeof modeDie.mode.entity.installed === "string" &&
      modeDie.mode.entity.installed &&
      modeDie.mode.entity.installed !== installed
    ) {
      // @beef should be done in paladin.
      console.log(
        `[DATASET] ${modeDie.mode.manifest.type}/${modeDie.mode.manifest.slug} ` +
          "dataset files differ from the installed stamp — reinstalling",
      );
      modeDie.mode.entity.installed = "";
    }

    modeDie.mode.finalizers = await stagger(modeDie.mode, modeDie, modeDie.traits);

    for (const name of modeDie.mode.manifest.traits.filter((name) => !modeDie.traits[name])) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${modeDie.mode.manifest.type}/${modeDie.mode.manifest.slug} ` +
          `declares ${name}, which ${modeDie.reference.absolute} does not offer`,
      );
    }

    if (modeDie.mode.module.aperture && !modeDie.mode.implements("EXPOSED")) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${modeDie.mode.manifest.type}/${modeDie.mode.manifest.slug} ` +
          "exports aperture without EXPOSED",
      );
    }
    if (modeDie.mode.module.datasink && !modeDie.mode.implements("DATASINK")) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${modeDie.mode.manifest.type}/${modeDie.mode.manifest.slug} ` +
          "exports datasink without DATASINK",
      );
    }

    modeDie.mode.entity.installed = installed;

    await modeDie.entities.mode.nativeUpdate(
      { id: modeDie.mode.entity.id },
      { installed: installed },
    );
  });
};
