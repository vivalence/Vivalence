import { ProductionResult } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";

import dataset from "./dataset/index.js";

export const manifest = {
  type: "tactic",
  slug: "test",
  traits: ["VALENTIC", "PRODUCER"],
};

export const producer = new Vector().open("/introduction", async (ctx) => {
  const [sentence] = await ctx.daemon.call("/pick/literal/feed", {
    take: 1,
    seek: ctx.input.seek,
    blacklist: ctx.input.blacklist,
  });

  if (!sentence) return ProductionResult.cast.exhausted({ reason: "out of sentences" });

  const tokens = (
    await Promise.all(
      sentence.data.ANNOTATED.tokens.map((token) => {
        return ctx.daemon.entities.literal.findOne(
          { slug: token.literal },
          { populate: ["memories"], populateWhere: { memories: { user: ctx.user.id } } },
        );
      }),
    )
  ).filter(Boolean);

  // const words = await ctx.daemon.call("/pick/literal/due", {take: 5, seek: { symbols: ["word", "proficiency.survival"] }, blacklist: { literals: tokens.map((t) => t.id) },});

  const products = [];

  if (!sentence.memory) {
    products.push({
      producer: ctx.daemon.modes.game.shadow.id,
      data: { BUFFERED: { literal: sentence, recall: "KNOWN", speed: { rate: "SLOW" } } },
      traits: ["BUFFERED"],
      commissioner: ctx.mode.id,
      literals: [sentence.id],
    });
  }

  for (const token of tokens) {
    if (!token.memory || token.memory.status === "UNKNOWN") {
      products.push({
        producer: ctx.daemon.modes.game.shadow.id,
        data: { BUFFERED: { literal: token, recall: "LEARNING", speed: { rate: "SLOW" } } },
        traits: ["BUFFERED"],
        commissioner: ctx.mode.id,
        literals: [token.id],
      });
    } else if (token.memory.status === "LEARNING") {
      products.push({
        producer: ctx.daemon.modes.game.flashcard.id,
        data: { BUFFERED: { literal: token, recall: "LEARNING" } },
        traits: ["BUFFERED"],
        commissioner: ctx.mode.id,
        literals: [token.id],
      });
    }
  }

  for (const token of tokens) {
    if (!token.memory || token.memory.status === "UNKNOWN") {
      products.push({
        producer: ctx.daemon.modes.game.write.id,
        data: { BUFFERED: { literal: token, recall: "LEARNING" } },
        traits: ["BUFFERED"],
        commissioner: ctx.mode.id,
        literals: [token.id],
      });
    }
  }

  if (!sentence.memory || sentence.memory.status === "UNKNOWN") {
    products.push({
      producer: ctx.daemon.modes.game.shadow.id,
      data: { BUFFERED: { literal: { ...sentence }, recall: "LEARNING" } },
      traits: ["BUFFERED"],
      commissioner: ctx.mode.id,
      literals: [sentence.id],
    });
  } else {
    products.push({
      producer: ctx.daemon.modes.game.write.id,
      data: { BUFFERED: { literal: { ...sentence }, recall: "LEARNING" } },
      traits: ["BUFFERED"],
      commissioner: ctx.mode.id,
      literals: [sentence.id],
    });
  }

  // words.map((word) => products.push({producer: { slug: "flashcard" }, data: { BUFFERED: { literal: word, recall: "LEARNING" } }, traits: ["BUFFERED"], commissioner: { slug: "test" },}),);

  return ProductionResult.cast.nominal({ products });
});

export { dataset };

// {"sentence": [{"id": "019cdda2-ba1c-7769-b879-074e23493df5", "createdAt": "2026-03-11T16:02:35.164Z", "updatedAt": "2026-03-11T16:02:35.307Z", "slug": "tudo-bem-tudo-bom", "data": {"TRANSLATED": {"known": "How's it going? All good.", "learning": "Tudo bem? Tudo bom."}, "ANNOTATED": {"tokens": [{"form": "Tudo", "gloss": "everything", "deprel": "nsubj", "index": 0, "literal": "tudo.pronoun"}, {"form": "bem", "gloss": "well", "deprel": "root", "index": 1, "literal": "bem.adverb"}, {"form": "Tudo", "gloss": "everything", "deprel": "nsubj", "index": 2, "literal": "tudo.pronoun"}, {"form": "bom", "gloss": "good", "deprel": "parataxis", "index": 3, "literal": "bom.adjective"}]}}, "symbol": {"proficiency": {"cefr": "a1"}, "sentence": {"force": "interrogative", "finiteness": "finite", "mood": "indicative", "tense": "present", "polarity": "positive", "interrogative-type": "polar", "politeness": "informal"}}, "traits": ["TRANSLATED", "ANNOTATED"], "rank": 999999}]}
// {"tokens": [{"id": "019cdda2-b9b0-717b-92ed-795dea12791a", "slug": "tudo.pronoun", "data": {"TRANSLATED": {"known": "everything", "learning": "tudo"}, "EXEMPLIFIED": {"known": "Everything is fine", "learning": "Tudo está bem"}, "RANKED": {"rank": 61, "zipf": 6.19, "fpm": 1550}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "pronoun", "word": {"lemma": "tudo", "part-of-speech": "pronoun", "pronoun-type": "total"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 61}, {"id": "019cdda2-b974-777f-b917-59eca63ccd4c", "slug": "bem.adverb", "data": {"TRANSLATED": {"known": "well / fine", "learning": "bem"}, "EXEMPLIFIED": {"known": "I am doing well", "learning": "Eu estou bem"}, "RANKED": {"rank": 54, "zipf": 6.22, "fpm": 1660}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "degree", "word": {"lemma": "bem", "part-of-speech": "adverb"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 54}, {"id": "019cdda2-b9b0-717b-92ed-795dea12791a", "slug": "tudo.pronoun", "data": {"TRANSLATED": {"known": "everything", "learning": "tudo"}, "EXEMPLIFIED": {"known": "Everything is fine", "learning": "Tudo está bem"}, "RANKED": {"rank": 61, "zipf": 6.19, "fpm": 1550}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "pronoun", "word": {"lemma": "tudo", "part-of-speech": "pronoun", "pronoun-type": "total"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 61}, {"id": "019cdda2-b973-7171-8cb2-c7f447db7073", "slug": "bom.adjective", "data": {"TRANSLATED": {"known": "good", "learning": "bom / boa"}, "EXEMPLIFIED": {"known": "The food was really good", "learning": "A comida estava muito boa"}, "RANKED": {"rank": 96, "zipf": 5.96, "fpm": 912}}, "symbol": {"proficiency": {"cefr": "a1"}, "word": {"gender": "masculine", "lemma": "bom", "number": "singular", "part-of-speech": "adjective"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 96}]}

// return ProductionResult.cast.nominal(from(literals, input.scope));

// ctx.daemon.modes.game.flashcards.call('/forLiteral',{literal})
// ctx.daemon.modes.game.flashcards.produce.
// ctx.daemon.valences.
// flashcards.aperture.open('forLiteral', ({literal},ctx) =>
//   return new Product().buffer = {literal}
//)
