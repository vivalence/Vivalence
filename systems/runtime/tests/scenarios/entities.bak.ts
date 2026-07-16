import { types, EntitySchema } from "@mikro-orm/core";

import {
  LiteralEntity,
  LiteralSchema,
  LiteralRepository,
  SymbolEntity,
  BufferEntity,
  TurnEntity,
} from "@vivalence/typology/entities";

import { SymbolConcrete, BufferConcrete, provider } from "@vivalence/typology/scenarios";
import { tiers, variant } from "./variant.js";

export enum LiteralTraits {
  TRANSLATED = "TRANSLATED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
}

// Standalone concrete of the base Literal — used by symbols-query.test.js, which
// boots its own ORM to exercise the typology LiteralRepository in isolation.
class TestLiteralRepository extends LiteralRepository {
  async feed(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    const filters: any = { ...where };
    if (blacklist?.literals?.length) {
      filters.id = { $nin: blacklist.literals.map((literal: any) => literal?.id ?? literal) };
    }
    return this.find(filters, { limit, populate });
  }
}

export const LiteralDomain = new EntitySchema({
  class: LiteralEntity,
  extends: LiteralSchema,
  tableName: "Literal",
  name: "Literal",
  repository: () => TestLiteralRepository,
  properties: {
    traits: {
      items: () => LiteralTraits,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },
  },
});

export { SymbolConcrete as SymbolDomain, BufferConcrete as BufferDomain };
export { LiteralEntity, SymbolEntity, BufferEntity, TurnEntity };

// Provision entities the way the runtime does (daemon/lifecycle/population.js):
// a tiered entity variant fed to the in-memory provider (the datamap contract).
// Memory + Trace are the real domain entities, carried in by variant(); fixtures
// are created through the registered classes (tiers.<type>.entity), never a copy.
export async function seed() {
  const datamap = await provider(variant());
  const { entities, orm } = datamap;
  const em = entities.em;

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

  // overlapping symbol sets — so an intersection query is non-trivial:
  //   greeting        → hello, goodbye, thanks, please
  //   greeting+casual → hello, goodbye
  //   greeting+polite → thanks, please
  for (const word of [hello, goodbye, thanks, please]) word.symbols.add(greeting);
  for (const word of [hello, goodbye]) word.symbols.add(casual);
  for (const word of [thanks, please]) word.symbols.add(polite);
  await em.flush();

  // ── minimal memory + trace — enough to prove aggregation wiring ──────
  const now = new Date();
  const memory = {
    known: em.create(tiers.memory.entity, {
      user,
      literal: hello,
      status: "KNOWN",
      state: {},
      nextAt: new Date(now.getTime() + 86_400_000), // future → not due
      lastAt: now,
    }),
    learning: em.create(tiers.memory.entity, {
      user,
      literal: goodbye,
      status: "LEARNING",
      state: {},
      nextAt: new Date(now.getTime() - 86_400_000), // past → due
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
    entities,
    fixtures: { user, hello, goodbye, thanks, please, greeting, memory, mode, intent, thread },
  };
}
