import { is, Blacklist, Scope } from "@vivalence/typology";

export default async function getNovelSymbols(input, ctx) {
  const { seek = {}, batch, stock } = input;

  const take = input.take || (batch || 0) + (stock || 0);
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: ctx.user.id });

  const qb = ctx.daemon.entities.symbol.createQueryBuilder("symbol");
  qb.where({});

  if (blacklist.symbols?.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.symbols } });
  }

  if (seek.symbols?.length > 0) {
    qb.andWhere({ id: { $in: seek.symbols } });
  }

  const subqueryParams = [ctx.user.id];
  let subquery = `NOT EXISTS (
        SELECT 1
        FROM Play play
        WHERE play.symbol = symbol.id
        AND play.user = ?`;

  if (is.id(scope.producer)) {
    subquery += ` AND play.producer = ?`;
    subqueryParams.push(scope.producer);
  }

  if (is.id(scope.commissioner)) {
    subquery += ` AND play.commissioner = ?`;
    subqueryParams.push(scope.commissioner);
  }

  subquery += `)`;

  qb.andWhere(subquery, subqueryParams);

  if (is.numberPositive(take)) qb.limit(take);

  return await qb.getResultList();
}
