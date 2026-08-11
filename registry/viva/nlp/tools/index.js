import { v, Vector } from "@vivalence/typology";

const feats = (encoded = "") => {
  if (!encoded) return {};
  return encoded
    .toLowerCase()
    .split("|")
    .reduce((folded, feat) => {
      if (!feat || feat === "_") return folded;
      let [key, value] = feat.split("=");
      if (!key || !value) return folded;
      if (key.includes("[")) return folded;
      if (value.includes(",")) value = value.split(",")[0];
      folded[key] = value;
      return folded;
    }, {});
};

const annotate = (token) => {
  const annotation = {
    token: token.token,
    ...(token.lemma && { lemma: token.lemma.toLowerCase() }),
    ...(token.upos && { pos: token.upos.toLowerCase() }),
    ...feats(token.feats),
  };
  if (["verb", "aux"].includes(annotation.pos)) {
    annotation.suffix = token.lemma.slice(-2).toLowerCase();
  }
  return annotation;
};

export const tools = new Vector().open(
  {
    nature: "/classify",
    valence: "Classify text grammatically — per token: lemma, part of speech, and the " +
      "morphological features (mood, tense, person, number, gender, case…). Multiword " +
      "tokens split (comprarlo → comprar + lo). The language is this daemon's own. " +
      'Example: { text: "María se mira" } → sentences: [[{ token: "María", pos: "propn" }, ' +
      '{ token: "se", lemma: "él", pos: "pron", reflex: "yes" }, { token: "mira", lemma: ' +
      '"mirar", pos: "verb", mood: "ind", tense: "pres", person: "3", number: "sing", ' +
      'suffix: "ar" }]]. Use it to diagnose which feature broke in a learner\'s answer, ' +
      "or to tag fresh material before authoring.",
    input: v.object({
      text: v.string().desc("A word, phrase or a few sentences — 1000 chars max."),
    }),
  },
  async (ctx) => {
    if (ctx.input.text.length > 1000) {
      return {
        condition: "ERROR",
        output: {
          message: `text is ${ctx.input.text.length} chars — the service takes 1000 max, send less`,
        },
      };
    }
    const sentences = await ctx.service({ text: ctx.input.text });
    return { output: { sentences: sentences.map((tokens) => tokens.map(annotate)) } };
  },
);
