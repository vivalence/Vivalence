// export async function classifier(rme) {
//   const vector = rme.instance.ontology.taxonomist;
//   const signal = new Signal("/text/signal");
//   const effect = await shotgun(vector, signal);
//   console.log("effect", effect);
//   // console.log("features ", features);
//   // console.log("features ", rme.instance.ontology);
// }

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

// export async function taxonomist(rme) {
//   const taxonomist = new Vector() //
//     .use(shards.caching.catchAndRelease((ctx) => JSON.stringify(ctx.params)));

//   taxonomist
//     .branch("/text") //
//     .open("/:input", async (ctx) => {
//       console.log("ctx, /text/:input");
//     });
//   taxonomist.branch("/text").open("/:signal", async (ctx) => {
//     console.log("signal", ctx.signal);
//     // const sentences = await ctx.service.nlp({ text: ctx.params.input });
//     // console.log(sentences);
//     // const tokens = sentences.flat();
//     // const features = [];
//     // // for (const token of tokens) {const tokenFeatures = await call(taxonomist, `/token/${JSON.stringify(token)}`, ctx,); if (tokenFeatures) features.push(...tokenFeatures);}
//     // return features.filter(Boolean);
//   });
//   // taxonomist.branch("/token").open("/:value", async (ctx) => {
//   //   const token = JSON.parse(ctx.params.value);
//   //   const annotation = {
//   //     lemma: token.lemma.toLowerCase(),
//   //     pos: token.upos.toLowerCase(),
//   //   };
//   //   if (["punct"].includes(annotation.pos)) return null;
//   //   const feats = parseFeats(token.feats);
//   //   Object.assign(annotation, feats);
//   //   if (["verb", "aux"].includes(annotation.pos)) {
//   //     annotation.suffix = token.lemma.slice(-2).toLowerCase();
//   //   }
//   //   const issues = await ctx.validate.annotation(annotation);
//   //   if (issues.length > 0) return null;
//   //   const feature = new Feature({ annotation, token });
//   //   // Resolve literal
//   //   feature.literal = await ctx.entities.literal.findOne(
//   //     { annotation: feature.annotation },
//   //     { fields: ["id"] },
//   //   );
//   //   return [feature];
//   // });

//   // rme.instance.ontology.taxonomist = taxonomist;
// }

// function contextMiddleware(runtime) {
//   return async (ctx, next) => {
//     ctx.service = runtime.service;
//     ctx.validate = runtime.validate;
//     ctx.entities = runtime.entities;
//     ctx.ontology = runtime.ontology;
//     await next();
//   };
// }

// import { Feature } from "@vivalence/typology";

// export async function classifier(rme) {
//   rme.instance.ontology.taxonomist
//     .branch("token")
//     .open(":value", async (ctx) => {
//       const annotation = {
//         lemma: ctx.params.value.lemma.toLowerCase(),
//         pos: ctx.params.value.upos.toLowerCase(),
//       };
//       const issues = await ctx.validate.annotation(annotation);
//       if (issues.length > 0) return null;
//       return new Feature({ annotation, token: ctx.params.value });
//     });
//   // console.log(rme);
//   // rme.instance.classify = async (signal, options) => {}
// }
