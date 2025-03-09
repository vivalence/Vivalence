import { enums } from "@vivalence/schema";

export default async function (body, ctx) {
  const { scope, tagIds, blacklist, take = 1 } = body;

  let debt = -take;
  const tags = [];

  // Try to get due tags first
  if (debt < 0) {
    const dueTags = await getDueTags({
      scope,
      tagIds,
      blacklist,
      take: Math.abs(debt),
      ctx,
    });

    if (dueTags.length > 0) {
      tags.push(...dueTags);
      debt += dueTags.length;
    }
  }

  // If we still need more tags, get new tags
  if (debt < 0) {
    const newTags = await getNewTags({
      scope,
      tagIds,
      blacklist,
      take: Math.abs(debt),
      ctx,
    });

    if (newTags.length > 0) {
      tags.push(...newTags);
      debt += newTags.length;
    }
  }

  return tags;
}

async function getDueTags({ scope, tagIds, blacklist, take, ctx }) {
  try {
    // Build query for finding due tags
    const qb = ctx.runtime.entities.em.createQueryBuilder(ctx.runtime.entities.tag);

    qb.select("t.*").from("Tag", "t").where({ runtime: ctx.runtime.entity.id });

    // Apply tag IDs filter if provided
    if (tagIds && tagIds.length > 0) {
      qb.andWhere({ id: { $in: tagIds } });
    }

    // Apply blacklist filter if provided
    if (blacklist && blacklist.tags && blacklist.tags.length > 0) {
      qb.andWhere({ id: { $nin: blacklist.tags } });
    }

    // Make sure tag has a Play record for the game that is due
    qb.andWhere(
      `EXISTS (
        SELECT 1 FROM Play p
        WHERE p.tag = t.id
        AND p.game = ?
        AND p.nextAt < ?
        AND p.user = ?
      )`,
      [scope.game?.id, new Date(), scope.user?.id],
    );

    // Make sure tag doesn't have a Memory with status KNOWN or GRADUATED
    qb.andWhere(
      `NOT EXISTS (
        SELECT 1 FROM Memory m
        WHERE m.tag = t.id
        AND m.unit IS NULL
        AND m.user = ?
        AND m.status IN (?)
      )`,
      [scope.user?.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
    );

    // Apply limit
    if (take) {
      qb.limit(take);
    }

    // Execute query
    const dueTags = await qb.getResult();
    return dueTags;
  } catch (error) {
    console.error("Error fetching due tags:", error);
    throw error;
  }
}

async function getNewTags({ scope, tagIds, blacklist, take, ctx }) {
  try {
    // Build query for finding new tags
    const qb = ctx.runtime.entities.em.createQueryBuilder(ctx.runtime.entities.tag);

    qb.select("t.*").from("Tag", "t").where({ runtime: ctx.runtime.entity.id });

    // Apply tag IDs filter if provided
    if (tagIds && tagIds.length > 0) {
      qb.andWhere({ id: { $in: tagIds } });
    }

    // Apply blacklist filter if provided
    if (blacklist && blacklist.tags && blacklist.tags.length > 0) {
      qb.andWhere({ id: { $nin: blacklist.tags } });
    }

    // Make sure tag doesn't have a Play record for the game
    qb.andWhere(
      `NOT EXISTS (
        SELECT 1 FROM Play p
        WHERE p.tag = t.id
        AND p.game = ?
        AND p.user = ?
      )`,
      [scope.game?.id, scope.user?.id],
    );

    // Make sure tag doesn't have a Memory with status KNOWN or GRADUATED
    qb.andWhere(
      `NOT EXISTS (
        SELECT 1 FROM Memory m
        WHERE m.tag = t.id
        AND m.unit IS NULL
        AND m.user = ?
        AND m.status IN (?)
      )`,
      [scope.user?.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
    );

    // Apply limit
    if (take) {
      qb.limit(take);
    }

    // Execute query
    const newTags = await qb.getResult();
    return newTags;
  } catch (error) {
    console.error("Error fetching new tags:", error);
    throw error;
  }
}
