import { is, Blacklist, Scope, Seek } from "@vivalence/typology";

export default async function getNovelLiterals(input, ctx) {
  const { batch, stock } = input;

  const take = input.take || (batch || 0) + (stock || 0);

  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: ctx.user.id });
  const seek = await new Seek().fromMask(ctx.input.seek, ctx);

  const qb = ctx.daemon.entities.literal.createQueryBuilder("literal");

  qb.where({});

  if (blacklist.literals?.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.literals } });
  }

  if (seek.literals?.length > 0) {
    qb.andWhere({ id: { $in: seek.literals.map((s) => s.id) } });
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

  qb.andWhere(
    `NOT EXISTS (
        SELECT 1
        FROM Memory memory
        WHERE memory.literal = literal.id
        AND memory.user = ? 
      )`,
    [
      ctx.user.id,
      //   ${scope.producer ? "AND memory.producer = ?" : ""}
      //   ${scope.commissioner ? "AND memory.commissioner = ?" : ""}
      // ...(is.id(scope.producer) ? [scope.producer] : []),
      // ...(is.id(scope.commissioner) ? [scope.commissioner] : []),
    ],
  );

  qb.orderBy({ rank: "ASC" });
  if (is.numberPositive(take)) qb.limit(take);

  const literals = await qb.getResultList();

  return literals;
}
