import { stagger } from "../../../gestalten/belt/index.js";
import { stamp } from "../traits/dataset.js";

export const traits = async (die) => {
  await die.context.datamap.shard.scope(async () => {
    const installed = await stamp(die.mode);

    if (
      typeof die.mode.entity.installed === "string" &&
      die.mode.entity.installed &&
      die.mode.entity.installed !== installed
    ) {
      // @beef should be done in paladin.
      console.log(
        `[DATASET] ${die.mode.manifest.type}/${die.mode.manifest.slug} dataset files differ from the installed stamp — reinstalling`,
      );
      die.mode.entity.installed = "";
    }

    die.mode.finalizers = await stagger(die.mode, die.context, die.traits);

    for (const name of die.mode.manifest.traits.filter((name) => !die.traits[name])) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} declares ${name}, which ${die.context.reference.absolute} does not offer`,
      );
    }

    if (die.mode.module.aperture && !die.mode.implements("EXPOSED")) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports aperture without EXPOSED`,
      );
    }
    if (die.mode.module.datasink && !die.mode.implements("DATASINK")) {
      // @beef should be done in paladin.
      console.warn(
        `[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports datasink without DATASINK`,
      );
    }

    die.mode.entity.installed = installed;

    await die.context.entities.mode.nativeUpdate(
      { id: die.mode.entity.id },
      { installed: installed },
    );
  });
};
