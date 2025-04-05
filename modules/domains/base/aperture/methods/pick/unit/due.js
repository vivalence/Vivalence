import { Blacklist, Scope } from "@vivalence/shared";

export default async function getDueUnits(input, ctx) {
  const { tagIds, take, dueLt = new Date().toISOString() } = input;

  const user = await ctx.runtime.services.identity.getUser();
  const blacklist = new Blacklist(input.blacklist);
  const scope = new Scope({
    ...input.scope,
    user: { id: user.id },
    runtime: { id: ctx.runtime.entity.id },
  });

  const qb = ctx.runtime.entities.unit.createQueryBuilder("u");
  qb.where({ runtime: ctx.runtime.entity.id });

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
    AND p.nextAt < ?
  `;

  const playParams = [new Date(dueLt)];

  if (scope.tactic?.id) {
    playQuery += ` AND p.tactic = ?`;
    playParams.push(scope.tactic.id);
  } else {
    playQuery += ` AND p.tactic IS NULL`;
  }

  if (scope.game?.id) {
    playQuery += ` AND p.game = ?`;
    playParams.push(scope.game.id);
  } else {
    playQuery += ` AND p.game IS NULL`;
  }

  if (scope.user?.id) {
    playQuery += ` AND p.user = ?`;
    playParams.push(scope.user.id);
  } else {
    playQuery += ` AND p.user IS NULL`;
  }

  qb.andWhere(`EXISTS (${playQuery})`, playParams);

  if (take) {
    qb.limit(take);
  }

  const units = await qb.getResultList();
  return units;
}

// export default async function getDueUnits(inputs, ctx) {
//   const { tagIds, blacklist, take, dueLt = new Date().toISOString(), scope = {} } = inputs;

//   console.log("inputs,", { tagIds, blacklist, take, dueLt, scope });

//   const unitRepository = ctx.runtime.entities.unit;

//   const qb = unitRepository.createQueryBuilder("u");

//   qb.where({ runtime: ctx.runtime.entity.id });

//   if (blacklist?.units && blacklist.units.length > 0) {
//     qb.andWhere({ id: { $nin: blacklist.units } });
//   }

//   if (tagIds && tagIds.length > 0) {
//     qb.andWhere(
//       `(
//           SELECT COUNT(DISTINCT tu.tag_entity_id)
//           FROM _TagToUnit tu
//           WHERE tu.unit_entity_id = u.id
//           AND tu.tag_entity_id IN (?)
//         ) = ?`,
//       [tagIds, tagIds.length],
//     );
//   }

//   qb.andWhere(
//     `EXISTS (
//           SELECT 1
//           FROM Play p
//           WHERE p.unit = u.id
//           AND p.nextAt < ?
//           AND p.tactic = ?
//           AND p.game = ?
//           AND p.user = ?
//         )`,
//     [new Date(dueLt), scope.tactic?.id, scope.game?.id, scope.user?.id],
//   );

//   const units = await qb.getResultList();
//   console.log("units fetched:", units.length);
//   return units;
// }

// import { enums } from "@vivalence/schema";

// export default async function getDueUnits(inputs, ctx) {
//   const { scope, blacklist, tagIds, take, dueLt = new Date().toISOString() } = inputs;
//   const { tactic, strategy, user } = scope;

//   try {
//     // Use MikroORM query builder for complex query
//     const qb = ctx.runtime.entities.em.createQueryBuilder(ctx.runtime.entities.unit);

//     // Start with selecting units
//     qb.select("u.*").from("Unit", "u").where({ runtime: ctx.runtime.entity.id });

//     // Apply unit blacklist if provided
//     if (blacklist?.units && blacklist.units.length > 0) {
//       qb.andWhere({ id: { $nin: blacklist.units } });
//     }

//     // Apply tag filtering - ensure units have all the specified tags
//     if (tagIds && tagIds.length > 0) {
//       // First handle tag blacklist if provided
//       let effectiveTagIds = tagIds;
//       if (blacklist?.tags && blacklist.tags.length > 0) {
//         effectiveTagIds = tagIds.filter((id) => !blacklist.tags.includes(id));
//       }

//       if (effectiveTagIds.length > 0) {
//         // Ensure unit has all the specified tags by counting matches
//         qb.andWhere(
//           `(
//             SELECT COUNT(DISTINCT tu.tag)
//             FROM _TagToUnit tu
//             WHERE tu.unit = u.id
//             AND tu.tag IN (?)
//           ) = ?`,
//           [effectiveTagIds, effectiveTagIds.length],
//         );
//       }
//     }

//     // Join with plays that match criteria
//     qb.andWhere(
//       `EXISTS (
//         SELECT 1
//         FROM Play p
//         WHERE p.unit = u.id
//         AND p.nextAt < ?
//         AND p.game = ?
//         AND p.tactic = ?
//         AND p.user = ?
//       )`,
//       [new Date(dueLt), strategy.id, tactic.id, user.id],
//     );

//     // Exclude units that have memories with KNOWN or GRADUATED status
//     qb.andWhere(
//       `NOT EXISTS (
//         SELECT 1
//         FROM Memory m
//         WHERE m.unit = u.id
//         AND m.tag IS NULL
//         AND m.user = ?
//         AND m.status IN (?)
//       )`,
//       [user.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
//     );

//     // Order by earliest next play time
//     qb.orderBy(
//       `(
//         SELECT MIN(p.nextAt)
//         FROM Play p
//         WHERE p.unit = u.id
//         AND p.game = ?
//         AND p.tactic = ?
//         AND p.user = ?
//       )`,
//       "ASC",
//       [strategy.id, tactic.id, user.id],
//     );

//     // Apply take limit
//     if (take) {
//       qb.limit(take);
//     }

//     // Execute query and get raw units
//     const rawUnits = await qb.getResult();

//     // Now we need to fetch the tags for each unit
//     // and format the response to match the expected structure
//     const formattedUnits = await Promise.all(
//       rawUnits.map(async (unit) => {
//         // Fetch tags for this unit
//         const tagToUnits = await ctx.runtime.entities.tagToUnit.find(
//           { unit: unit.id },
//           { populate: ["tag"] },
//         );

//         // Extract the tags
//         const tags = tagToUnits.map((relation) => relation.tag);

//         // Return the formatted unit
//         return {
//           ...unit,
//           tags,
//         };
//       }),
//     );

//     return formattedUnits;
//   } catch (error) {
//     console.error("Error fetching due units:", error);
//     throw error;
//   }
// }

// // export default async function getDueUnits(inputs, ctx) {
// //   throw new Error("UNTESTED CLAUDE GARBAGE!");
// //   const { scope, blacklist, tagIds, take, dueLt = new Date().toISOString() } = inputs;
// //   const { tactic, strategy, user } = scope;

// //   try {
// //     let query = ctx.runtime.services.supabase.from("_TagToUnit").select("B").in("A", tagIds);

// //     // Apply tag blacklist
// //     if (blacklist.tags && blacklist.tags.length > 0) {
// //       query = query.not("A", "in", `(${blacklist.tags.join(",")})`);
// //     }

// //     const { data: matchedRelations, error: matchError } = await query;
// //     if (matchError) throw matchError;

// //     const unitIds = matchedRelations.map((r) => r.B);

// //     let unitsQuery = ctx.runtime.services.supabase
// //       .from("Unit")
// //       .select(
// //         `
// //         *,
// //         tags:_TagToUnit(tag:A(*)),
// //         plays:Play!inner(*)
// //       `,
// //       )
// //       .in("id", unitIds)
// //       .eq("runtimeId", ctx.runtime.manifest.id)
// //       .eq("plays.gameId", strategy.id)
// //       .eq("plays.tacticId", tactic.id)
// //       .eq("plays.userId", user.id)
// //       .lt("plays.nextPlay", dueLt)
// //       .not(
// //         "id",
// //         "in",
// //         ctx.runtime.services.supabase
// //           .from("Memory")
// //           .select("unitId")
// //           .is("tagId", null)
// //           .eq("userId", user.id)
// //           .in("status", ["KNOWN", "GRADUATED"]),
// //       );

// //     // Apply unit blacklist
// //     if (blacklist.units && blacklist.units.length > 0) {
// //       unitsQuery = unitsQuery.not("id", "in", `(${blacklist.units.join(",")})`);
// //     }

// //     // Apply take limit
// //     if (take !== undefined) {
// //       unitsQuery = unitsQuery.limit(take);
// //     }

// //     const { data: units, error: unitsError } = await unitsQuery;
// //     if (unitsError) throw unitsError;

// //     // Filter units that have all required tags
// //     const fullyMatchedUnits = units.filter((unit) => unit.tags.length === tagIds.length);

// //     // Format the tags for each unit
// //     const formattedUnits = fullyMatchedUnits.map((unit) => ({
// //       ...unit,
// //       tags: unit.tags.map(({ tag }) => tag),
// //     }));

// //     return formattedUnits;
// //   } catch (error) {
// //     console.error("Error fetching due units:", error);
// //     throw error;
// //   }
// // }
