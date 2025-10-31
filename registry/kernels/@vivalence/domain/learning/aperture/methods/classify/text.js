import config from "@vivalence/paladin";

export default async function ({ text }, ctx) {
  console.log("classify", text);
  //
  //   const features = await ctx.runtime.ontology.classify.text(input.text);
  //   console.log("FEATURES", features[0]);
  //   for (const feature of features) {
  //     const unit = await ctx.runtime.call("/pick/unit/byAnnotation", {
  //       annotation: feature.annotation,
  //     });
  //     console.log("UNIT", feature, unit);
  //   }
}
