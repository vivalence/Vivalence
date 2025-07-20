import { Blacklist, Scope } from "@vivalence/shared";

export default async function getDueUnits(input, ctx) {
  const { tagIds, take, dueLt = new Date().toISOString() } = input;

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({ ...input.scope, user: { id: user.id } });

  const qb = ctx.runtime.entities.unit.createQueryBuilder("u");
  qb.where({});

  if (blacklist?.units && blacklist.units.length > 0) {
    qb.andWhere({ id: { $nin: blacklist.units } });
  }

  if (tagIds && tagIds.length > 0) {
    qb.andWhere(
      `(
        SELECT COUNT(DISTINCT tu.tag_entity_id)
        FROM _TagToUnit tu
        WHERE tu.unit_entity_id = u.id
        AND tu.tag_entity_id IN (?)
      ) = ?`,
      [tagIds, tagIds.length],
    );
  }

  let playQuery = `
    SELECT 1
    FROM Play p
    WHERE p.unit = u.id
    AND p.user = ?
    AND p.nextAt < ?
  `;

  const playParams = [user.id, new Date(dueLt)];

  if (scope.tactic?.slug) {
    playQuery += ` AND p.tactic = ?`;
    playParams.push(scope.tactic.slug);
  } else {
    playQuery += ` AND p.tactic IS NULL`;
  }

  if (scope.game?.slug) {
    playQuery += ` AND p.game = ?`;
    playParams.push(scope.game.slug);
  } else {
    playQuery += ` AND p.game IS NULL`;
  }

  if (scope.strategy?.slug) {
    playQuery += ` AND p.strategy = ?`;
    playParams.push(scope.strategy.slug);
  } else {
    playQuery += ` AND p.strategy IS NULL`;
  }

  qb.andWhere(`EXISTS (${playQuery})`, playParams);

  if (take) {
    qb.limit(take);
  }

  const units = await qb.getResultList();
  return units;
}
