import { contexts, Path, shard, Twitch } from "@vivalence/typology";
import { provider } from "@vivalence/runtime/scenarios";
import { ActivityEntity, ActivityRepository, gestalten, sets } from "@vivalence/runtime";
import { stack, tiers } from "./tiers.js";

const { gather, mint, strike } = gestalten.belt;

export const DAEMON = "test-daemon";

export async function seed(domain = {}) {
  const { entities: descriptors, twitch: twitches } = gestalten.belt.assemble(stack);
  const datamap = await provider(descriptors);
  const { orm } = datamap;
  const em = datamap.entities.em;
  const twitch = new Twitch();
  for (const held of twitches) twitch.graft(held);
  twitch.branch("/after").use(shard.datamap.detached(datamap));
  datamap.registerSubscriber(twitch);
  const activity = new ActivityRepository(orm.em, ActivityEntity);
  const runtime = { ...datamap.entities, activity };

  const user = em.create(tiers.user.entity, { slug: "beef" });
  const daemon = em.create(tiers.daemon.entity, { slug: DAEMON, mask: { manifest: { type: "daemon", slug: DAEMON } } });
  await em.flush();
  em.setFilterParams("user", { user: user.id });

  const traits = Object.fromEntries(Object.keys(sets.traits).map((kind) => [kind, gather(domain, [], kind)]));
  const entities = { ...runtime, ...strike(mint({ slug: DAEMON, kinds: sets.traits, traits }), em, sets.traits) };

  const held = {
    slug: DAEMON,
    manifest: { slug: DAEMON, traits: [] },
    reference: new Path(`/daemon/${DAEMON}`),
    entities,
    datamap,
    domain,
    twitch: new Twitch(),
    modes: {},
    providers: {},
  };
  held.twitch.use(shard.context.spread(contexts.host, held)).use(shard.datamap.owned());
  held.twitch.branch("/after").use(shard.datamap.detached(datamap));
  if (domain.twitch) held.twitch.graft(domain.twitch);
  datamap.registerSubscriber(held.twitch);

  const mode = entities.mode.create({
    slug: "dojo",
    type: "game",
    traits: ["VIEWABLE", "INTENTED", "EMITTER"],
    installed: "seed",
  });
  await em.flush();

  const symbol = (slug, trait = {}) => entities.symbol.create({ slug, mode, traits: ["ONTOLOGICAL"], trait });
  const greeting = symbol("greeting");
  const casual = symbol("casual");
  const polite = symbol("polite");
  const tense = symbol("word.tense.presente", {
    LABELED: { name: "presente" },
  });
  const mood = symbol("word.mood.indicativo", {
    LABELED: { name: "indicativo" },
  });
  const first = symbol("word.person.first", { LABELED: { name: "eu" } });
  const second = symbol("word.person.second", { LABELED: { name: "tu" } });
  const singular = symbol("word.number.singular", {
    LABELED: { name: "singular" },
  });
  await em.flush();

  const literal = (slug, known, learning, extra = {}) => {
    const { symbols = [], ...rest } = extra;
    const entity = entities.literal.create({
      slug,
      mode,
      ontology: "word",
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known, learning } },
      symbol: {},
      ...rest,
    });
    for (const attached of symbols) entity.symbols.add(attached);
    return entity;
  };

  const hello = literal("hello", "hello", "olá", {
    symbols: [greeting, casual],
  });
  const goodbye = literal("goodbye", "goodbye", "tchau", {
    symbols: [greeting, casual],
  });
  const thanks = literal("thanks", "thanks", "obrigado", {
    symbols: [greeting, polite],
    traits: ["TRANSLATED", "VOCALIZED"],
    trait: {
      TRANSLATED: { known: "thanks", learning: "obrigado" },
      VOCALIZED: { asset: { path: "audio/thanks.mp3", type: "audio/mpeg" } },
    },
  });
  const please = literal("please", "please", "por favor", {
    symbols: [greeting, polite],
  });

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

  const chamo = literal("chamo.verb", "I call", "chamo", {
    symbols: [first, singular],
  });
  const chamas = literal("chamas.verb", "you call", "chamas", {
    symbols: [second, singular],
  });
  const chamar = literal("chamar.verb", "to call", "chamar");

  const paradigm = entities.literal.create({
    slug: "chamar.presente.indicativo",
    mode,
    ontology: "conjugation",
    traits: [],
    trait: {
      CONJUGATED: {
        infinitive: "chamar.verb",
        paradigm: {
          "first.singular": "chamo.verb",
          "second.singular": "chamas.verb",
        },
      },
    },
    symbol: {},
  });
  paradigm.symbols.add(tense);
  paradigm.symbols.add(mood);
  await em.flush();

  const now = Date.now();
  const retained = (row, status, lastSignal, due) =>
    entities.note.create({
      user,
      literal: row,
      slug: `retention.${row.slug}`,
      traits: ["RETAINED"],
      trait: { RETAINED: { driver: "BAYESIAN", status, lastSignal, state: {}, due: new Date(due).toISOString(), lastAt: now } },
    });
  const retention = {
    known: retained(hello, "KNOWN", "SUCCESS", now + 86_400_000),
    learning: retained(goodbye, "LEARNING", "MISTAKE", now - 86_400_000),
  };
  await em.flush();

  const traced = (row, parent, signal) =>
    entities.note.create({
      user,
      literal: row,
      parent,
      slug: `trace.${crypto.randomUUID()}`,
      traits: ["TRACED"],
      trait: { TRACED: { signal: { enum: signal }, snapshot: { status: parent.trait.RETAINED.status, due: parent.trait.RETAINED.due } } },
    });
  traced(hello, retention.known, "SUCCESS");
  traced(goodbye, retention.learning, "MISTAKE");
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
    entities,
    runtime,
    twitch,
    held,
    fixtures: {
      user,
      daemon,
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
