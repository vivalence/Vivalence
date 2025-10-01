import { Signal, Feature } from "@vivalence/typology";

class Text extends Signal {
  constructor(value) {
    super("text", value);
  }
}

class Token extends Signal {
  forms = [Text];
  constructor(value) {
    super("token", value);
  }
}

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

export default new Map([
  [
    Text,
    [
      async (text, ctx, next) => {
        const sentences = await ctx.service.nlp({ text });
        const tokens = sentences.flat().map((token) => new Token(token));

        return await next(tokens);
      },
    ],
  ],
  [
    Token,
    [
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

        const issues = await ctx.validate.annotation(annotation);
        if (issues.length > 0) {
          console.log("@ontology/extractors.js [TOKEN EXTRACTOR ISSUE]");
          // console.log({ token, annotation, issues });
          return null;
        }

        return new Feature({ annotation, token });
      },
    ],
  ],
]);
