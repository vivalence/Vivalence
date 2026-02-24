export const DATASET = async (mode, daemon) => {
  if (mode.entity.installed) return;

  if (mode.cake.dataset.entities.literal) {
    for (const literal of mode.cake.dataset.entities.literal) {
      let issues = await daemon.validate.literal(literal, [
        "SCHEMATIC",
        "EXISTENTIAL",
        "RELATIONAL",
      ]);
      // console.log("---".repeat(10));
      // console.log({ literal, issues });
      if (issues.length > 0) issues = await daemon.kernel.medic.many(issues, { daemon });
      if (issues.length > 0) console.json({ UNRESOLVED_LITERAL_INSTALL: issues });
      // console.log({ literal, issues });
    }

    await daemon.entities.em.flush();
  }
};
