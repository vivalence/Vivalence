import { stagger, stamp } from "../../gestalten/belt/index.js";

export const traits = async (die) => {
  await die.daemon.datamap.shard.scope(async () => {
    const held = die.mode.entity.installed;
    const fresh = await stamp(die.mode);
    if (typeof held === "string" && held && held !== fresh) {
      console.log(`[DATASET] ${die.mode.manifest.type}/${die.mode.manifest.slug} dataset files differ from the installed stamp — reinstalling`);
      die.mode.entity.installed = "";
    }

    die.mode.finalizers = await stagger(die.mode, die.daemon, die.traits);

    if (die.mode.module.aperture && !die.mode.implements("EXPOSED")) {
      console.warn(`[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports aperture without EXPOSED`);
    }
    if (die.mode.module.datasink && !die.mode.implements("DATASINK")) {
      console.warn(`[trait] ${die.mode.manifest.type}/${die.mode.manifest.slug} exports datasink without DATASINK`);
    }

    die.mode.entity.installed = fresh;
    await die.daemon.entities.mode.nativeUpdate({ id: die.mode.entity.id }, { installed: fresh });
  });
};
