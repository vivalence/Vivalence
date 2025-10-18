import { Aperture } from "@vivalence/vector/aperture";

export const aperture = new Aperture()
  .open("/classify/:type", async (body, ctx) => {
    const input = ctx.body[ctx.params.type];
    if (!input) throw new Error(`Missing ${ctx.params.type} in request body`);

    const features = await ctx.runtime.classify[ctx.params.type](input);

    return {
      type: ctx.params.type,
      input,
      features: features.map((f) => ({
        annotation: f.annotation,
        token: f.token,
        literal: f.literal ? { id: f.literal.id } : null,
      })),
    };
  })
  .open("/classify/text/:text", async (body, ctx) => {
    const features = await ctx.runtime.classify.text(ctx.params.text);
    return {
      type: "text",
      input: ctx.params.text,
      features: features.map((f) => ({
        annotation: f.annotation,
        token: f.token,
        literal: f.literal ? { id: f.literal.id } : null,
      })),
    };
  });
// import { Signal } from "@vivalence/typology";
// import { Aperture } from "@vivalence/vector/aperture";

// export const aperture = new Aperture() //
//   .open("/classify/:type", async (body, ctx) => {
//     const signal = {};
//     signal.type = ctx.params.type;
//     signal.value = ctx.body[signal.type];

//     // const signal = [new signature.signal(type), new ]
//     // const features = await classify(signal);
//   });

// // console.log("classify", signal, ctx.runtime, ctx.module);
// //   const features = await ctx.runtime.ontology.classify.text(input.text);
// //   console.log("FEATURES", features[0]);
// //   for (const feature of features) {
// //     const unit = await ctx.runtime.call("/pick/unit/byAnnotation", {
// //       annotation: feature.annotation,
// //     });
// //     console.log("UNIT", feature, unit);
// //   }
