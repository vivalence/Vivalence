import { is, Blacklist, Scope } from "@vivalence/typology";

export default async function getDueSymbols(input, ctx) {
  const { seek = {}, batch, stock, dueLt = new Date().toISOString() } = input;

  const take = input.take || (batch || 0) + (stock || 0);
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: ctx.user.id });

  const qb = ctx.daemon.entities.symbol.createQueryBuilder("symbol");
  qb.where({});

  if (blacklist?.symbols && blacklist.symbols.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.symbols } });
  }

  if (seek.symbols?.length > 0) {
    qb.andWhere({ id: { $in: seek.symbols } });
  }

  const playParams = [ctx.user.id, new Date(dueLt)];
  let playQuery = `EXISTS (
    SELECT 1
    FROM Play play
    WHERE play.symbol = symbol.id
    AND play.user = ?
    AND play.nextAt < ?`;

  if (is.id(scope.producer)) {
    playQuery += ` AND play.producer = ?`;
    playParams.push(scope.producer);
  }

  if (is.id(scope.commissioner)) {
    playQuery += ` AND play.commissioner = ?`;
    playParams.push(scope.commissioner);
  }

  playQuery += `)`;

  qb.andWhere(playQuery, playParams);

  if (is.numberPositive(take)) qb.limit(take);

  return await qb.getResultList();
}
