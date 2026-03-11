import { ProductionResult } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

import dataset from "./dataset/index.js";

const manifest = {
  type: "tactic",
  slug: "test",
  traits: ["VALENTIC", "PRODUCER"],
};

const production = new Aperture().branch("/generate").open("/test", async (ctx) => {
  console.log("tactic production");
  const [sentence] = await ctx.daemon.call("/pick/literal/feed", {
    take: 1,
    seek: { symbols: ["sentence"] },
  });

  console.log({ sentence });
  const tokens = await Promise.all(
    sentence.data.ANNOTATED.tokens.map((token) => {
      return ctx.daemon.entities.literal.findOne(
        { slug: token.literal, memories: { user: ctx.user.id } },
        { populate: ["memories"] },
      );
    }),
  );
  console.json({ tokens });
  return ProductionResult.cast.exhausted({ reason: "testing" });
});

export { manifest, dataset, production };

// {"sentence": [{"id": "019cdda2-ba1c-7769-b879-074e23493df5", "createdAt": "2026-03-11T16:02:35.164Z", "updatedAt": "2026-03-11T16:02:35.307Z", "slug": "tudo-bem-tudo-bom", "data": {"TRANSLATED": {"known": "How's it going? All good.", "learning": "Tudo bem? Tudo bom."}, "ANNOTATED": {"tokens": [{"form": "Tudo", "gloss": "everything", "deprel": "nsubj", "index": 0, "literal": "tudo.pronoun"}, {"form": "bem", "gloss": "well", "deprel": "root", "index": 1, "literal": "bem.adverb"}, {"form": "Tudo", "gloss": "everything", "deprel": "nsubj", "index": 2, "literal": "tudo.pronoun"}, {"form": "bom", "gloss": "good", "deprel": "parataxis", "index": 3, "literal": "bom.adjective"}]}}, "symbol": {"proficiency": {"cefr": "a1"}, "sentence": {"force": "interrogative", "finiteness": "finite", "mood": "indicative", "tense": "present", "polarity": "positive", "interrogative-type": "polar", "politeness": "informal"}}, "traits": ["TRANSLATED", "ANNOTATED"], "rank": 999999}]}
// {"tokens": [{"id": "019cdda2-b9b0-717b-92ed-795dea12791a", "slug": "tudo.pronoun", "data": {"TRANSLATED": {"known": "everything", "learning": "tudo"}, "EXEMPLIFIED": {"known": "Everything is fine", "learning": "Tudo está bem"}, "RANKED": {"rank": 61, "zipf": 6.19, "fpm": 1550}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "pronoun", "word": {"lemma": "tudo", "part-of-speech": "pronoun", "pronoun-type": "total"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 61}, {"id": "019cdda2-b974-777f-b917-59eca63ccd4c", "slug": "bem.adverb", "data": {"TRANSLATED": {"known": "well / fine", "learning": "bem"}, "EXEMPLIFIED": {"known": "I am doing well", "learning": "Eu estou bem"}, "RANKED": {"rank": 54, "zipf": 6.22, "fpm": 1660}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "degree", "word": {"lemma": "bem", "part-of-speech": "adverb"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 54}, {"id": "019cdda2-b9b0-717b-92ed-795dea12791a", "slug": "tudo.pronoun", "data": {"TRANSLATED": {"known": "everything", "learning": "tudo"}, "EXEMPLIFIED": {"known": "Everything is fine", "learning": "Tudo está bem"}, "RANKED": {"rank": 61, "zipf": 6.19, "fpm": 1550}}, "symbol": {"proficiency": {"cefr": "a1"}, "functional": "pronoun", "word": {"lemma": "tudo", "part-of-speech": "pronoun", "pronoun-type": "total"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 61}, {"id": "019cdda2-b973-7171-8cb2-c7f447db7073", "slug": "bom.adjective", "data": {"TRANSLATED": {"known": "good", "learning": "bom / boa"}, "EXEMPLIFIED": {"known": "The food was really good", "learning": "A comida estava muito boa"}, "RANKED": {"rank": 96, "zipf": 5.96, "fpm": 912}}, "symbol": {"proficiency": {"cefr": "a1"}, "word": {"gender": "masculine", "lemma": "bom", "number": "singular", "part-of-speech": "adjective"}}, "traits": ["EXEMPLIFIED", "TRANSLATED", "RANKED"], "rank": 96}]}

// return ProductionResult.cast.nominal(from(literals, input.scope));
