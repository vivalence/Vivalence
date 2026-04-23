import { Vector } from "@vivalence/typology";

import conjugations from "./conjugations.js";
import questions from "./questions.js";
import connectors from "./connectors.js";
import negation from "./negation.js";
import pronouns from "./pronouns.js";
import determiners from "./determiners.js";
import adverbs from "./adverbs.js";
import numbers from "./numbers.js";
import degrees from "./degrees.js";
import prepositions from "./prepositions.js";
import audioWords from "./audio-words.js";
import audioSentences from "./audio-sentences.js";

const regular = (ctx) =>
  conjugations(ctx, {
    symbols: ["word.regularity.regular"],
    groups: ["ar", "er", "ir"].map((suffix) => ({
      symbols: [`word.suffix.${suffix}`],
      label: suffix,
    })),
  });

const irregular = (ctx) =>
  conjugations(ctx, {
    symbols: ["word.regularity.irregular"],
    title: "Irregular verbs",
  });

const serEstar = (ctx) =>
  conjugations(ctx, {
    groups: ["ser", "estar"].map((lemma) => ({
      symbols: [`word.lemma.${lemma}`],
      label: lemma,
    })),
  });

export const emitter = new Vector()
  .open("/regular-conjugations", regular)
  .open("/irregular-conjugations", irregular)
  .open("/ser-estar", serEstar)
  .open("/questions", questions)
  .open("/connectors", connectors)
  .open("/negation", negation)
  .open("/pronouns", pronouns)
  .open("/determiners", determiners)
  .open("/adverbs", adverbs)
  .open("/numbers", numbers)
  .open("/degrees", degrees)
  .open("/prepositions", prepositions)
  .open("/audio-words", audioWords)
  .open("/audio-sentences", audioSentences);
