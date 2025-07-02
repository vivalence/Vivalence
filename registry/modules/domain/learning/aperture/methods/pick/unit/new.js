import { Blacklist, Scope } from "@vivalence/shared";

export default async function getNewUnits(input, ctx) {
  const { tagIds, take } = input;

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);

  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
  });

  const qb = ctx.runtime.entities.unit.createQueryBuilder("u");
  qb.where({});

  if (blacklist.units?.length > 0) {
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

  qb.andWhere(
    `NOT EXISTS (
        SELECT 1
        FROM Play p
        WHERE p.unit = u.id
        AND p.user = ? 
        ${scope.tactic?.slug ? "AND p.tactic = ?" : ""}
        ${scope.game?.slug ? "AND p.game = ?" : ""}
        ${scope.strategy?.slug ? "AND p.strategy = ?" : ""}
      )`,
    [
      user.id,
      ...(scope.tactic?.slug ? [scope.tactic.slug] : []),
      ...(scope.game?.slug ? [scope.game.slug] : []),
      ...(scope.strategy?.slug ? [scope.strategy.slug] : []),
    ],
  );

  if (take) qb.limit(take);

  const units = await qb.getResultList();

  return units;
}
