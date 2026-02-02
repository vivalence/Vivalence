import config from "@vivalence/paladin";

export async function text(input, ctx) {
  const features = await ctx.daemon.classify.text(input.text);
  // console.log(JSON.stringify({ features },null,2));
  // console.json(features);

  const added = [];
  for (const feature of features) {
    if (!feature?.annotation) continue;

    await ctx.daemon.assert.annotation(feature.annotation, [
      "SCHEMATIC",
      "RELATIONAL",
      "EXISTENTIAL",
    ]);

    added.push({
      token: feature.token?.token,
      lemma: feature.annotation.lemma,
      pos: feature.annotation.pos,
    });
  }

  console.log({ added });
  return added;
}
