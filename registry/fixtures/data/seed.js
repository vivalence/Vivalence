import { provider } from "@vivalence/runtime/scenarios";
import { assemble } from "./assemble.js";
import { stack, tiers } from "./tiers.js";

export async function seed() {
  const { entities, subscribers } = assemble(stack);
  const datamap = await provider(entities, subscribers);
  const { orm } = datamap;
  const em = datamap.entities.em;

  const user = em.create(tiers.user.entity, { roles: ["USER"], config: {} });
  await em.flush();
  em.setFilterParams("user", { user: user.id });

  const symbol = (slug, trait = {}) => em.create(tiers.symbol.entity, { slug, traits: ["ONTOLOGICAL"], trait });
  const greeting = symbol("greeting");
  const casual = symbol("casual");
  const polite = symbol("polite");
  const tense = symbol("word.tense.presente", { LABELED: { name: "presente" } });
  const mood = symbol("word.mood.indicativo", { LABELED: { name: "indicativo" } });
  const first = symbol("word.person.first", { LABELED: { name: "eu" } });
  const second = symbol("word.person.second", { LABELED: { name: "tu" } });
  const singular = symbol("word.number.singular", { LABELED: { name: "singular" } });
  await em.flush();

  const literal = (slug, known, learning, extra = {}) => {
    const { symbols = [], ...rest } = extra;
    const entity = em.create(tiers.literal.entity, {
      slug,
      ontology: "word",
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known, learning } },
      symbol: {},
      ...rest,
    });
    for (const attached of symbols) entity.symbols.add(attached);
    return entity;
  };

  const hello = literal("hello", "hello", "olá", { symbols: [greeting, casual] });
  const goodbye = literal("goodbye", "goodbye", "tchau", { symbols: [greeting, casual] });
  const thanks = literal("thanks", "thanks", "obrigado", {
    symbols: [greeting, polite],
    traits: ["TRANSLATED", "VOCALIZED"],
    trait: {
      TRANSLATED: { known: "thanks", learning: "obrigado" },
      VOCALIZED: { asset: { path: "audio/thanks.mp3", type: "audio/mpeg" } },
    },
  });
  const please = literal("please", "please", "por favor", { symbols: [greeting, polite] });

  const sentence = literal("ola-tchau", "hello and goodbye", "olá e tchau", {
    ontology: "sentence",
    traits: ["TRANSLATED", "ANNOTATED"],
    trait: {
      TRANSLATED: { known: "hello and goodbye", learning: "olá e tchau" },
      ANNOTATED: {
        tokens: [
          { form: "olá", gloss: "hello", literal: "hello" },
          { form: "e", gloss: "and" },
          { form: "tchau", gloss: "goodbye", literal: "goodbye" },
        ],
      },
    },
  });

  const chamo = literal("chamo.verb", "I call", "chamo", { symbols: [first, singular] });
  const chamas = literal("chamas.verb", "you call", "chamas", { symbols: [second, singular] });
  const chamar = literal("chamar.verb", "to call", "chamar");

  const paradigm = em.create(tiers.literal.entity, {
    slug: "chamar.presente.indicativo",
    ontology: "conjugation",
    traits: [],
    trait: {
      CONJUGATED: {
        infinitive: "chamar.verb",
        paradigm: { "first.singular": "chamo.verb", "second.singular": "chamas.verb" },
      },
    },
    symbol: {},
  });
  paradigm.symbols.add(tense);
  paradigm.symbols.add(mood);
  await em.flush();

  const now = new Date();
  const retention = {
    known: em.create(tiers.retention.entity, {
      user,
      literal: hello,
      status: "KNOWN",
      lastSignal: "SUCCESS",
      state: {},
      nextAt: new Date(now.getTime() + 86_400_000),
      lastAt: now,
    }),
    learning: em.create(tiers.retention.entity, {
      user,
      literal: goodbye,
      status: "LEARNING",
      lastSignal: "MISTAKE",
      state: {},
      nextAt: new Date(now.getTime() - 86_400_000),
      lastAt: now,
    }),
  };
  await em.flush();

  em.create(tiers.trace.entity, {
    user,
    literal: hello,
    retention: retention.known,
    signal: { enum: "SUCCESS" },
    status: "SUCCESS",
    snapshot: {},
  });
  em.create(tiers.trace.entity, {
    user,
    literal: goodbye,
    retention: retention.learning,
    signal: { enum: "MISTAKE" },
    status: "MISTAKE",
    snapshot: {},
  });
  await em.flush();

  const mode = em.create(tiers.mode.entity, {
    slug: "dojo",
    type: "game",
    traits: ["APPLICATION", "INTENTED", "EMITTER", "STANDALONE"],
    installed: true,
  });
  await em.flush();

  const intent = em.create(tiers.intent.entity, {
    slug: "survival-flashcard",
    traits: ["MASKED"],
    name: "Survival Flashcard",
    trait: { MASKED: { where: { symbols: ["greeting"] }, gameplay: "FLIP" } },
    mode,
    user,
  });
  await em.flush();

  const thread = em.create(tiers.thread.entity, {
    user,
    mode,
    intent,
    trait: {},
    cursor: 0,
    counter: 0,
  });
  await em.flush();

  return {
    orm,
    em,
    datamap,
    entities: datamap.entities,
    fixtures: {
      user,
      hello,
      goodbye,
      thanks,
      please,
      sentence,
      paradigm,
      chamar,
      chamo,
      chamas,
      greeting,
      retention,
      mode,
      intent,
      thread,
    },
  };
}
