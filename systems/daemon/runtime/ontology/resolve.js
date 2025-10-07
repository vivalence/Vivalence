import { Feature, Signal } from "@vivalence/typology";
import { shotgun } from "@vivalence/vector/controller";

export async function classifier(rme) {
  const vector = rme.instance.ontology.taxonomist;
  const signal = new Signal("/text/signal");
  const effect = await shotgun(vector, signal);
  console.log("effect", effect);
  // console.log("features ", features);
  // console.log("features ", rme.instance.ontology);
}

// rme.instance.ontology.classify = {text: async (text) => await call(taxonomist, `/text/${text}`, {service: rme.instance.service, validate: rme.instance.validate, entities: rme.instance.entities,}),};

// export const shoot = async (vector, signals, context = {}) =>
//   Promise.all(
//     shotgun(vector, signals) //
//       .map(async ({ effect, carry, match }) => {
//         if (!effect) return null;
//         const ctx = { ...context, match, params: match.parameters || {} };
//         let result;
//         await carry(ctx, async () => (result = await effect(ctx)));
//         return result;
//       }),
//   ).then((results) => results.filter(Boolean));
// }

//   // Register feature resolution middleware on taxonomist
//   runtime.ontology.taxonomist.use(async (ctx, next) => {
//     await next();

//     if (ctx.effect && Array.isArray(ctx.effect)) {
//       ctx.effect = await Promise.all(
//         ctx.effect.map(async (feature) => {
//           if (!(feature instanceof Feature)) return feature;

//           let issues = await ctx.validate.annotation(feature.annotation, [
//             "SCHEMATIC",
//             "EXISTENTIAL",
//             "RELATIONAL",
//           ]);

//           issues = issues.map((issue) => {
//             issue.context.feature = feature;
//             return issue;
//           });

//           issues = await ctx.ontology.remedy.many(issues, { runtime });

//           if (issues.length > 0) {
//             console.log("[@ontology/resolve.js feature extraction error]");
//             return null;
//           }

//           feature.literal = await ctx.entities.literal.findOne(
//             { annotation: feature.annotation },
//             { fields: ["id"] },
//           );

//           return feature;
//         }),
//       );
//     }
//   });
//   runtime.ontology.taxonomist.on(Feature, async (feature, ctx) => {
//     let issues = await ctx.validate.annotation(
//       feature.annotation, //
//       ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],
//     );

//     issues = issues.map((issue) => {
//       issue.context.feature = feature;
//       return issue;
//     });

//     issues = await ctx.ontology.remedy.many(issues, { runtime });

//     if (issues.length > 0) {
//       console.log("[@boot/ontology/classifier.js feature extraction error]");
//       // console.log(issues);
//       // console.log("/[classifier feature extraction error]");
//       return null;
//     }

//     feature.literal = await ctx.entities.literal //
//       .findOne({ annotation: feature.annotation }, { fields: ["id"] });

//     return feature;
//   });

//   const ctx = {
//     ontology: runtime.ontology,
//     schema: runtime.schema,
//     validate: runtime.validate,
//     assert: runtime.assert,
//     service: runtime.service,
//   };

//   console.log(runtime.ontology.taxonomist.forms);

//   runtime.classify = {};
//   for (const Form of runtime.ontology.taxonomist.forms) {
//     console.log(Form);
//     // runtime.classify[Form.type] = async (signal) => {
//     //   const signal = new Form(signal);
//     //   let features = await ctx.classifier.spawn(signal, ctx);
//     //   return features;
//     // };
//     //
//   }

//   // if (!Form) throw new UnknownFormError(name);
// }
