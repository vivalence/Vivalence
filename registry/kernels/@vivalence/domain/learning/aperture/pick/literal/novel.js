import { is, Blacklist, Scope } from "@vivalence/typology";

export default async function getNovelLiterals(input, ctx) {
  const { seek = {}, batch, stock } = input;

  const take = input.take || (batch || 0) + (stock || 0);

  const blacklist = new Blacklist(input.blacklist);

  const scope = new Scope({ ...input.scope, user: ctx.user.id });

  const qb = ctx.daemon.entities.literal.createQueryBuilder("literal");

  qb.where({});

  if (blacklist.literals?.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.literals } });
  }

  if (seek.literals?.length > 0) {
    qb.andWhere({ id: { $in: seek.literals } });
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

  qb.andWhere(
    `NOT EXISTS (
        SELECT 1
        FROM Play play
        WHERE play.literal = literal.id
        AND play.user = ? 
        ${scope.producer ? "AND play.producer = ?" : ""}
        ${scope.commissioner ? "AND play.commissioner = ?" : ""}
      )`,
    [
      ctx.user.id,
      ...(is.id(scope.producer) ? [scope.producer] : []),
      ...(is.id(scope.commissioner) ? [scope.commissioner] : []),
    ],
  );

  if (is.numberPositive(take)) qb.limit(take);

  const literals = await qb.getResultList();

  return literals;
}
