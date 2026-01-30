import { is, Blacklist, Scope } from "@vivalence/typology";

export default async function getNovelSymbols(input, ctx) {
  const { seek = {}, batch, stock } = input;

  const take = input.take || (batch || 0) + (stock || 0);
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: { id: ctx.user.id } });

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

  if (scope.producer?.id) {
    subquery += ` AND play.producer = ?`;
    subqueryParams.push(scope.producer.id);
  }

  if (scope.generator?.id) {
    subquery += ` AND play.generator = ?`;
    subqueryParams.push(scope.generator.id);
  }

  subquery += `)`;

  qb.andWhere(subquery, subqueryParams);

  if (is.numberPositive(take)) qb.limit(take);

  return await qb.getResultList();
}
