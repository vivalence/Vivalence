import { Blacklist, Scope } from "@vivalence/typology";

export default async function getDueLiterals(input, ctx) {
  const { seek, batch, stock, dueLt = new Date().toISOString() } = input;

  const take = input.take || (batch || 0) + (stock || 0);
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: { id: ctx.user.id } });

  const qb = ctx.daemon.entities.literal.createQueryBuilder("literal");
  qb.where({});

  if (blacklist?.literals && blacklist.literals.length > 0) {
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
      [seek.symbols, seek.symbols.length],
    );
  }

  let playQuery = `
    SELECT 1
    FROM Play play
    WHERE play.literal = literal.id
    AND play.user = ?
    AND play.nextAt < ?
  `;

  const playParams = [ctx.user.id, new Date(dueLt)];

  if (scope.producer?.id) {
    playQuery += ` AND play.producer = ?`;
    playParams.push(scope.producer.id);
  }

  if (scope.generator?.id) {
    playQuery += ` AND play.generator = ?`;
    playParams.push(scope.generator.id);
  }

  qb.andWhere(`EXISTS (${playQuery})`, playParams);

  if (take) qb.limit(take);

  const literals = await qb.getResultList();
  return literals;
}
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

//   let playQuery = `
//     SELECT 1
//     FROM Play p
//     WHERE p.literal = u.id
//     AND p.user = ?
//     AND p.nextAt < ?
//   `;

//   const playParams = [user.id, new Date(dueLt)];

//   if (scope.tactic?.slug) {
//     playQuery += ` AND p.tactic = ?`;
//     playParams.push(scope.tactic.slug);
//   } else {
//     playQuery += ` AND p.tactic IS NULL`;
//   }

//   if (scope.game?.slug) {
//     playQuery += ` AND p.game = ?`;
//     playParams.push(scope.game.slug);
//   } else {
//     playQuery += ` AND p.game IS NULL`;
//   }

//   if (scope.strategy?.slug) {
//     playQuery += ` AND p.strategy = ?`;
//     playParams.push(scope.strategy.slug);
//   } else {
//     playQuery += ` AND p.strategy IS NULL`;
//   }

//   qb.andWhere(`EXISTS (${playQuery})`, playParams);

//   if (take) {
//     qb.limit(take);
//   }

//   const literals = await qb.getResultList();
//   return literals;
// }
