import { enums } from "@vivalence/schema";

export default async function (body, ctx) {
  const { scope, tagIds, blacklist, take = 1 } = body;

  let debt = -take;
  const units = [];

  // Try to get due units first
  if (debt < 0) {
    const dueUnits = await getDueUnits({
      tagIds,
      blacklist: blacklist?.units || [],
      take: Math.abs(debt),
      scope,
      ctx,
    });
    console.log("dueUnits ", dueUnits);

    if (dueUnits.length > 0) {
      units.push(...dueUnits);
      debt += dueUnits.length;
    }
  }

  // If we still need more units, get new units
  if (debt < 0) {
    const newUnits = await getNewUnits({
      tagIds,
      blacklist: blacklist?.units || [],
      take: Math.abs(debt),
      scope,
      ctx,
    });

    if (newUnits.length > 0) {
      units.push(...newUnits);
      debt += newUnits.length;
    }
  }

  return units;
}

async function getDueUnits({ tagIds, blacklist, take, scope, ctx }) {
  const qb = ctx.runtime.entities.em.createQueryBuilder(ctx.runtime.entities.unit);

  qb.select("u.*").from("Unit", "u").where({ runtime: ctx.runtime.entity.id });

  // if (blacklist && blacklist.length > 0) {
  //   qb.andWhere({ id: { $nin: blacklist } });
  // }

  // // If tag IDs are provided, ensure unit has all specified tags
  // if (tagIds && tagIds.length > 0) {
  //   // Count how many of the specified tags the unit has
  //   qb.andWhere(
  //     `(
  //         SELECT COUNT(DISTINCT tu.tag)
  //         FROM _TagToUnit tu
  //         WHERE tu.unit = u.id
  //         AND tu.tag IN (?)
  //       ) = ?`,
  //     [tagIds, tagIds.length],
  //   );
  // }

  // // Ensure unit has plays that are due
  // qb.andWhere(
  //   `EXISTS (
  //       SELECT 1
  //       FROM Play p
  //       WHERE p.unit = u.id
  //       AND p.tag IS NULL
  //       AND p.nextAt < ?
  //       ${scope.tactic?.id ? "AND p.tactic = ?" : ""}
  //       ${scope.game?.id ? "AND p.game = ?" : ""}
  //       ${scope.user?.id ? "AND p.user = ?" : ""}
  //     )`,
  //   [
  //     new Date(),
  //     ...(scope.tactic?.id ? [scope.tactic.id] : []),
  //     ...(scope.game?.id ? [scope.game.id] : []),
  //     ...(scope.user?.id ? [scope.user.id] : []),
  //   ],
  // );

  // // Ensure unit doesn't have memory with KNOWN or GRADUATED status
  // qb.andWhere(
  //   `NOT EXISTS (
  //       SELECT 1
  //       FROM Memory m
  //       WHERE m.unit = u.id
  //       AND m.tag IS NULL
  //       AND m.user = ?
  //       AND m.status IN (?)
  //     )`,
  //   [scope.user?.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
  // );

  // // Order by earliest nextAt
  // qb.orderBy(
  //   `(
  //       SELECT MIN(p.nextAt)
  //       FROM Play p
  //       WHERE p.unit = u.id
  //       AND p.tag IS NULL
  //       ${scope.tactic?.id ? "AND p.tactic = ?" : ""}
  //       ${scope.game?.id ? "AND p.game = ?" : ""}
  //       ${scope.user?.id ? "AND p.user = ?" : ""}
  //     )`,
  //   "ASC",
  //   [
  //     ...(scope.tactic?.id ? [scope.tactic.id] : []),
  //     ...(scope.game?.id ? [scope.game.id] : []),
  //     ...(scope.user?.id ? [scope.user.id] : []),
  //   ],
  // );

  // Apply limit
  if (take) {
    // qb.limit(take);
  }

  // Execute query
  const units = await qb.getResult();
  return units;
}

async function getNewUnits({ tagIds, blacklist, take, scope, ctx }) {
  // Use query builder for complex query with EXISTS/NOT EXISTS
  const qb = ctx.runtime.entities.em.createQueryBuilder(ctx.runtime.entities.unit);

  // Start with basic query
  qb.select("u.*").from("Unit", "u").where({ runtime: ctx.runtime.entity.id });

  // Apply blacklist filter
  if (blacklist && blacklist.length > 0) {
    qb.andWhere({ id: { $nin: blacklist } });
  }

  // If tag IDs are provided, ensure unit has all specified tags
  if (tagIds && tagIds.length > 0) {
    // Count how many of the specified tags the unit has
    qb.andWhere(
      `(
          SELECT COUNT(DISTINCT tu.tag)
          FROM _TagToUnit tu
          WHERE tu.unit = u.id
          AND tu.tag IN (?)
        ) = ?`,
      [tagIds, tagIds.length],
    );
  }

  // Ensure unit doesn't have any matching plays
  qb.andWhere(
    `NOT EXISTS (
        SELECT 1
        FROM Play p
        WHERE p.unit = u.id
        ${scope.tactic?.id ? "AND p.tactic = ?" : ""}
        ${scope.game?.id ? "AND p.game = ?" : ""}
        ${scope.user?.id ? "AND p.user = ?" : ""}
        ${ctx.runtime.entity.id ? "AND p.runtime = ?" : ""}
      )`,
    [
      ...(scope.tactic?.id ? [scope.tactic.id] : []),
      ...(scope.game?.id ? [scope.game.id] : []),
      ...(scope.user?.id ? [scope.user.id] : []),
      ...(ctx.runtime.entity.id ? [ctx.runtime.entity.id] : []),
    ],
  );

  // Order by index
  qb.orderBy("u.index", "ASC");

  // Apply limit
  if (take) {
    qb.limit(take);
  }

  // Execute query
  const units = await qb.getResult();
  return units;
}
