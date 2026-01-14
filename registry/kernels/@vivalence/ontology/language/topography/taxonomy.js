import { Vector } from "@vivalence/vector";
import { Classifiable, Feature } from "@vivalence/typology";

class Text extends Classifiable {
  constructor(value) {
    super("text", value);
  }
}

class Token extends Classifiable {
  forms = [Text];
  constructor(value) {
    super("token", value);
  }
}

export default [
  [
    Text,
    async (text, ctx, next) => {
      const sentences = await ctx.services.nlp({ text });
      const tokens = sentences.flat().map((token) => new Token(token));
      // console.log("@taxonomy", { tokens });
      return await next(tokens);
    },
  ],
  [
    Token,
    async function (token, ctx) {
      const annotation = {
        lemma: token.lemma.toLowerCase(),
        pos: token.upos.toLowerCase(),
      };
      if (["punct"].includes(annotation.pos)) return null;

      const feats = parseFeats(token.feats);
      for (const key in feats) {
        annotation[key] = feats[key].toLowerCase();
      }

      if (["verb", "aux"].includes(annotation.pos)) {
        annotation.suffix = token.lemma.slice(-2).toLowerCase();
      }

      // console.log("@taxonomy", { annotation });

      const issues = await ctx.validate.annotation(annotation);
      if (issues.length > 0) {
        console.log("@ontology/extractors.js [TOKEN EXTRACTOR ISSUE]");
        // console.log({ token, annotation, issues });
        return null;
      }

      return { annotation, token };
    },
  ],
];

function parseFeats(featsString = "") {
  let feats = {};
  if (!featsString) return feats;

  feats = featsString
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
    }, feats);

  return feats;
}
// class Text extends Signal {
//   type = "text";
//   // constructor(value) {
//   //   super("text", value);
//   // }
// }

// class Token extends Signal {
//   type = "token";
//   forms = [Text];
//   // constructor(value) {
//   //   super("token", value);
//   // }
// }

// export const extractors = new Vector()
//   .branch("/text")
//   .open("/:input", async (ctx) => {
//     const sentences = await ctx.service.nlp({ text: ctx.params.input });
//     const tokens = sentences.flat().map((token) => new Token(token));

//     const results = [];
//     for (const token of tokens) {
//       const features = await ctx.cast.token(token.value);
//       if (features) results.push(...features);
//     }

//     return results;
//   });

// extractors.branch("/token").open("/:value", async (ctx) => {
//   const token =
//     typeof ctx.params.value === "string"
//       ? JSON.parse(ctx.params.value)
//       : ctx.params.value;

//   const annotation = {
//     lemma: token.lemma.toLowerCase(),
//     pos: token.upos.toLowerCase(),
//   };

//   if (["punct"].includes(annotation.pos)) return null;

//   const feats = parseFeats(token.feats);
//   for (const key in feats) {
//     annotation[key] = feats[key];
//   }

//   if (["verb", "aux"].includes(annotation.pos)) {
//     annotation.suffix = token.lemma.slice(-2).toLowerCase();
//   }

//   const issues = await ctx.validate.annotation(annotation);
//   if (issues.length > 0) {
//     console.log("@ontology/extractors.js [TOKEN EXTRACTOR ISSUE]");
//     return null;
//   }

//   return [new Feature({ annotation, token })];
// });

// function parseFeats(featsString = "") {
//   let feats = {};
//   if (!featsString) return feats;

//   return featsString
//     .toLowerCase()
//     .split("|")
//     .reduce((acc, feat) => {
//       if (!feat || feat === "_") return acc;
//       let [key, value] = feat.split("=");

//       if (!key || !value) return acc;
//       if (key.includes("[")) return acc;
//       if (value.includes(",")) value = value.split(",")[0];

//       acc[key] = value.toLowerCase();
//       return acc;
//     }, feats);
// }

// export default extractors;
