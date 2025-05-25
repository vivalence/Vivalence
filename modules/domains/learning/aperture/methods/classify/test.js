import config from "@vivalence/config";

export default async function ({ text }, ctx) {
  const features = await ctx.runtime.ontology.classify.text(text);
  // console.log(JSON.stringify(features.map((f) => f.annotation)));
  console.log(features);
  console.log(JSON.stringify(features));

  //   for (const feature of features) {
  //     const unit = await ctx.runtime.call("/pick/unit/byAnnotation", {
  //       annotation: feature.annotation,
  //     });
  //     console.log("UNIT", feature, unit);
  //   }
}
