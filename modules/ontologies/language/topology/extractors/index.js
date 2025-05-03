import { ClassifierSignal, ClassifierFeature } from "@vivalence/shared";

class Text extends ClassifierSignal {
  constructor(value) {
    super("text", value);
  }
}

class Token extends ClassifierSignal {
  generators = [Text];
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
      return await next(tokens);
    },
  ],
  [
    Token,
    function (token, ctx) {
      const feats = parseFeats(token.feats);

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

      const annotation = {
        lemma: token.lemma,
        pos: token.upos.toLowerCase(),
      };

      for (const key in feats) {
        annotation[key] = feats[key];
      }

      if (["verb", "aux"].includes(annotation.pos)) {
        annotation.suffix = token.lemma.slice(-2);
      }

      return new ClassifierFeature({ annotation, token });
    },
  ],
];
