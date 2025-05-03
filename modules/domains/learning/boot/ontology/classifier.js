export function classifierFactory(runtime) {
  return (ontology) => {
    // runtime.aperture.open("/classify", async (input, ctx) => {
    //   const features = await ctx.runtime.ontology.classify.text(input.text);
    //   console.log("FEATURES", features[0]);
    //   for (const feature of features) {
    //     const unit = await ctx.runtime.call("/pick/unit/byAnnotation", {
    //       annotation: feature.annotation,
    //     });
    //     console.log("UNIT", feature, unit);
    //   }
    // });

    const ctx = {
      // schema, validators
      services: runtime.services,
    };

    return ontology.classifier.with(ctx);
  };
}
