import { provider } from "@vivalence/typology/scenarios";
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

  const literal = (slug, known, learning) =>
    em.create(tiers.literal.entity, {
      slug,
      traits: ["TRANSLATED"],
      trait: { TRANSLATED: { known, learning } },
      symbol: {},
    });

  const hello = literal("hello", "hello", "olá");
  const goodbye = literal("goodbye", "goodbye", "tchau");
  const thanks = literal("thanks", "thanks", "obrigado");
  const please = literal("please", "please", "por favor");

  const symbol = (slug) => em.create(tiers.symbol.entity, { slug, traits: ["ONTOLOGICAL"], trait: {} });
  const greeting = symbol("greeting");
  const casual = symbol("casual");
  const polite = symbol("polite");
  await em.flush();

  for (const word of [hello, goodbye, thanks, please]) word.symbols.add(greeting);
  for (const word of [hello, goodbye]) word.symbols.add(casual);
  for (const word of [thanks, please]) word.symbols.add(polite);
  await em.flush();

  const now = new Date();
  const memory = {
    known: em.create(tiers.memory.entity, {
      user,
      literal: hello,
      status: "KNOWN",
      state: {},
      nextAt: new Date(now.getTime() + 86_400_000),
      lastAt: now,
    }),
    learning: em.create(tiers.memory.entity, {
      user,
      literal: goodbye,
      status: "LEARNING",
      state: {},
      nextAt: new Date(now.getTime() - 86_400_000),
      lastAt: now,
    }),
  };
  await em.flush();

  em.create(tiers.trace.entity, {
    user,
    literal: hello,
    memory: memory.known,
    signal: { enum: "SUCCESS" },
    status: "SUCCESS",
    snapshot: {},
  });
  em.create(tiers.trace.entity, {
    user,
    literal: goodbye,
    memory: memory.learning,
    signal: { enum: "MISTAKE" },
    status: "MISTAKE",
    snapshot: {},
  });
  await em.flush();

  const mode = em.create(tiers.mode.entity, {
    slug: "flashcard",
    type: "game",
    traits: ["APPLICATION", "INTENTED", "EMITTER"],
    installed: true,
  });
  await em.flush();

  const intent = em.create(tiers.intent.entity, {
    slug: "survival-flashcard",
    traits: ["MASKED"],
    name: "Survival Flashcard",
    trait: { MASKED: { where: { symbols: ["greeting"] } } },
    mode,
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
    fixtures: { user, hello, goodbye, thanks, please, greeting, memory, mode, intent, thread },
  };
}
