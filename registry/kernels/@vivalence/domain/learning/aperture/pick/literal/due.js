import { Blacklist, Seek, Scope } from "@vivalence/typology";

export default async function getDueLiterals(input, ctx) {
  const { batch, stock, dueLt = new Date() } = input;

  const take = input.take || (batch || 0) + (stock || 0);
  const blacklist = new Blacklist(input.blacklist);
  const seek = await new Seek().fromMask(ctx.input.seek, ctx);

  const qb = ctx.daemon.entities.literal.createQueryBuilder("literal");
  qb.where({});

  if (blacklist?.literals?.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.literals } });
  }

  if (seek.symbols?.length > 0) {
    qb.andWhere(
      `(
      SELECT COUNT(DISTINCT sl.symbol_entity_id)
      FROM symbol_literals sl
      WHERE sl.literal_entity_id = literal.id
      AND sl.symbol_entity_id IN (?)
    ) = ?`,
      [seek.symbols.map((s) => s.id), seek.symbols.length],
    );
  }

  qb.joinAndSelect("literal.memories", "memory", {
    "memory.user": ctx.user.id,
    "memory.nextAt": { $lt: dueLt },
  });

  if (take) qb.limit(take);

  const literals = await qb.getResultList();
  return literals;
}

// export default async function getDueLiterals(input, ctx) {
//   const { batch, stock, dueLt = new Date() } = input;

//   const take = input.take || (batch || 0) + (stock || 0);
//   const blacklist = new Blacklist(input.blacklist);
//   const scope = new Scope({ ...input.scope, user: ctx.user.id });
//   const seek = await new Seek().fromMask(ctx.input.seek, ctx);

//   const qb = ctx.daemon.entities.literal.createQueryBuilder("literal");
//   qb.where({});

//   if (blacklist?.literals?.length > 0) {
//     qb.andWhere({ id: { $nin: blacklist.literals } });
//   }

//   if (seek.symbols?.length > 0) {
//     qb.andWhere(
//       `(
//       SELECT COUNT(DISTINCT sl.symbol_entity_id)
//       FROM symbol_literals sl
//       WHERE sl.literal_entity_id = literal.id
//       AND sl.symbol_entity_id IN (?)
//     ) = ?`,
//       [seek.symbols.map((s) => s.id), seek.symbols.length],
//     );
//   }

//   let memoryQuery = `
//     SELECT 1
//     FROM Memory memory
//     WHERE memory.literal = literal.id
//     AND memory.user = ?
//     AND memory.nextAt < ?
//   `;

//   const memoryParams = [ctx.user.id, dueLt];

//   // if (scope.producer) {memoryQuery += ` AND memory.producer = ?`; memoryParams.push(scope.producer);}
//   // if (scope.commissioner) {memoryQuery += ` AND memory.commissioner = ?`; memoryParams.push(scope.commissioner);}

//   qb.andWhere(`EXISTS (${memoryQuery})`, memoryParams);
//   if (take) qb.limit(take);

//   const literals = await qb.getResultList();

//   return literals;
// }

// import { Blacklist, Scope } from "@vivalence/typology";

// export default async function getDueLiterals(input, ctx) {
//   const { seek, batch, dueLt = new Date().toISOString() } = input;

//   const user = await ctx.runtime.services.identity.getUser();
//   const blacklist = new Blacklist(input.blacklist);
//   const scope = new Scope({ ...input.scope, user: { id: user.id } });

//   const qb = ctx.runtime.entities.literal.createQueryBuilder("u");
//   qb.where({});

//   if (blacklist?.literals && blacklist.literals.length > 0) {
//     qb.andWhere({ id: { $nin: blacklist.literals } });
//   }

//   if (symbolIds && symbolIds.length > 0) {
//     qb.andWhere(
//       `(
//         SELECT COUNT(DISTINCT tu.symbol_entity_id)
//         FROM _SymbolToLiteral tu
//         WHERE tu.literal_entity_id = u.id
//         AND tu.symbol_entity_id IN (?)
//       ) = ?`,
//       [symbolIds, symbolIds.length],
//     );
//   }

//   let memoryQuery = `
//     SELECT 1
//     FROM Memory p
//     WHERE p.literal = u.id
//     AND p.user = ?
//     AND p.nextAt < ?
//   `;

//   const memoryParams = [user.id, new Date(dueLt)];

//   if (scope.tactic?.slug) {
//     memoryQuery += ` AND p.tactic = ?`;
//     memoryParams.push(scope.tactic.slug);
//   } else {
//     memoryQuery += ` AND p.tactic IS NULL`;
//   }

//   if (scope.game?.slug) {
//     memoryQuery += ` AND p.game = ?`;
//     memoryParams.push(scope.game.slug);
//   } else {
//     memoryQuery += ` AND p.game IS NULL`;
//   }

//   if (scope.strategy?.slug) {
//     memoryQuery += ` AND p.strategy = ?`;
//     memoryParams.push(scope.strategy.slug);
//   } else {
//     memoryQuery += ` AND p.strategy IS NULL`;
//   }

//   qb.andWhere(`EXISTS (${memoryQuery})`, memoryParams);

//   if (take) {
//     qb.limit(take);
//   }

//   const literals = await qb.getResultList();
//   return literals;
// }
