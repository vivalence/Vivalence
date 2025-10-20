import { Vector } from "@vivalence/vector";
import { Signal, Feature } from "@vivalence/typology";
import { shards } from "@vivalence/vector";

export async function taxonomist(rme) {
  const taxonomist = new Vector() //
    .use(shards.caching.catchAndRelease((ctx) => JSON.stringify(ctx.params)));
  taxonomist
    .branch("/text") //
    .open("/:input", async (ctx) => {
      console.log("ctx, /text/:input");
    });
  taxonomist.branch("/text").open("/:signal", async (ctx) => {
    console.log("signal", ctx.signal);
    // const sentences = await ctx.service.nlp({ text: ctx.params.input });
    // console.log(sentences);
    // const tokens = sentences.flat();
    // const features = [];
    // // for (const token of tokens) {const tokenFeatures = await call(taxonomist, `/token/${JSON.stringify(token)}`, ctx,); if (tokenFeatures) features.push(...tokenFeatures);}
    // return features.filter(Boolean);
  });
  // taxonomist.branch("/token").open("/:value", async (ctx) => {
  //   const token = JSON.parse(ctx.params.value);
  //   const annotation = {
  //     lemma: token.lemma.toLowerCase(),
  //     pos: token.upos.toLowerCase(),
  //   };
  //   if (["punct"].includes(annotation.pos)) return null;
  //   const feats = parseFeats(token.feats);
  //   Object.assign(annotation, feats);
  //   if (["verb", "aux"].includes(annotation.pos)) {
  //     annotation.suffix = token.lemma.slice(-2).toLowerCase();
  //   }
  //   const issues = await ctx.validate.annotation(annotation);
  //   if (issues.length > 0) return null;
  //   const feature = new Feature({ annotation, token });
  //   // Resolve literal
  //   feature.literal = await ctx.entities.literal.findOne(
  //     { annotation: feature.annotation },
  //     { fields: ["id"] },
  //   );
  //   return [feature];
  // });

  rme.instance.ontology.taxonomist = taxonomist;
}

function contextMiddleware(runtime) {
  return async (ctx, next) => {
    ctx.service = runtime.service;
    ctx.validate = runtime.validate;
    ctx.entities = runtime.entities;
    ctx.ontology = runtime.ontology;
    await next();
  };
}

function parseFeats(featsString = "") {
  let feats = {};
  if (!featsString) return feats;

  return featsString
    .toLowerCase()
    .split("|")
    .reduce((acc, feat) => {
      if (!feat || feat === "_") return acc;
      let [key, value] = feat.split("=");

      if (!key || !value) return acc;
      if (key.includes("[")) return acc;
      if (value.includes(",")) value = value.split(",")[0];

      acc[key] = value;
      return acc;
    }, {});
}

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
