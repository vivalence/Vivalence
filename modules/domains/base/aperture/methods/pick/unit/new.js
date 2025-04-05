import { Blacklist, Scope } from "@vivalence/shared";

export default async function getNewUnits(input, ctx) {
  const { tagIds, take } = input;

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);

  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
    runtime: { id: ctx.runtime.entity.id },
  });

  const qb = ctx.runtime.entities.unit.createQueryBuilder("u");
  qb.where({ runtime: ctx.runtime.entity.id });

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
        ${scope.tactic?.id ? "AND p.tactic = ?" : ""}
        ${scope.game?.id ? "AND p.game = ?" : ""}
        ${scope.user?.id ? "AND p.user = ?" : ""}
        ${scope.runtime?.id ? "AND p.runtime = ?" : ""}
      )`,
    [
      ...(scope.tactic?.id ? [scope.tactic.id] : []),
      ...(scope.game?.id ? [scope.game.id] : []),
      ...(scope.user?.id ? [scope.user.id] : []),
      ...(scope.runtime.id ? [scope.runtime.id] : []),
    ],
  );

  qb.orderBy({ index: "ASC" });
  if (take) qb.limit(take);

  const units = await qb.getResultList();

  return units;
}
