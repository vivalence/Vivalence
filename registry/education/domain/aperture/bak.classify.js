import config from "@vivalence/paladin";

export async function text(input, ctx) {
  const features = await ctx.daemon.classify.text(input.text);

  const added = [];
  for (const feature of features) {
    if (!feature?.annotation) continue;

    await ctx.daemon.assert.annotation(feature.annotation, {
      processors: ["SCHEMATIC", "RELATIONAL", "EXISTENTIAL"],
      context: { feature },
    });

    const literal = await ctx.daemon.entities.literal //
      .findOne({ annotation: feature.annotation });

    added.push({
      token: feature.token,
      annotation: feature.annotation,
      literal,
    });
  }

  return added;
}
