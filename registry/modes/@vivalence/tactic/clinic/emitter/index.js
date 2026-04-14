import { Vector } from "@vivalence/typology";
import { extractParadigm } from "./tools.js";

import regularConjugations from "./regular-conjugations.js";
import irregularConjugations from "./irregular-conjugations.js";
import questions from "./questions.js";
import connectors from "./connectors.js";
import negation from "./negation.js";
import pronouns from "./pronouns.js";
import determiners from "./determiners.js";
import adverbs from "./adverbs.js";
import numbers from "./numbers.js";
import degrees from "./degrees.js";
import prepositions from "./prepositions.js";
import serEstar from "./ser-estar.js";

import introduce from "./introduce.js";
import drill from "./drill.js";
import reinforce from "./reinforce.js";
import hunt from "./hunt.js";
import audioWords from "./audio-words.js";
import audioSentences from "./audio-sentences.js";

export const emitter = new Vector()
  // ── middleware: survey helper ──────────────────────────────────────
  .use(async (ctx, next) => {
    const baseSymbols = ctx.input.where?.symbols ?? [];

    ctx.survey = async (ontology, extraSymbols = []) => {
      const symbols = [...baseSymbols, ...extraSymbols];
      if (ontology === "conjugation") {
        const paradigms = await ctx.daemon.entities.literal.find(
          { ontology: "conjugation", symbols },
          { populate: ["uses.memories", "symbols", "memories"] },
        );
        return paradigms.map(extractParadigm);
      }
      return ctx.daemon.entities.literal.find(
        { ontology, symbols },
        { populate: ["memories", "symbols"] },
      );
    };

    await next();
  })
  // ── scope routes (user-facing intents) ────────────────────────────
  .open("/regular-conjugations", regularConjugations)
  .open("/irregular-conjugations", irregularConjugations)
  .open("/questions", questions)
  .open("/connectors", connectors)
  .open("/negation", negation)
  .open("/pronouns", pronouns)
  .open("/determiners", determiners)
  .open("/adverbs", adverbs)
  .open("/numbers", numbers)
  .open("/degrees", degrees)
  .open("/prepositions", prepositions)
  .open("/ser-estar", serEstar)
  // ── sub-emitter routes (composition) ──────────────────────────────
  .open("/introduce", introduce)
  .open("/drill", drill)
  .open("/reinforce", reinforce)
  .open("/hunt", hunt)
  .open("/audio-words", audioWords)
  .open("/audio-sentences", audioSentences);
