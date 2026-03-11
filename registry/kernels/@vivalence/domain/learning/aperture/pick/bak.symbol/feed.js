import getDueSymbols from "./due.js";
import getNovelSymbols from "./novel.js";

export default async function (input, ctx) {
  const { scope, seek, blacklist, batch, stock } = input;
  const take = input.take || (batch || 0) + (stock || 0);

  let debt = -take;
  const symbols = [];

  if (debt < 0) {
    const dueSymbols = await getDueSymbols(
      { blacklist, scope, seek, take: Math.abs(debt) },
      ctx,
    );

    if (dueSymbols.length > 0) {
      symbols.push(...dueSymbols);
      debt += dueSymbols.length;
    }
  }

  if (debt < 0) {
    const novelSymbols = await getNovelSymbols(
      { scope, blacklist, seek, take: Math.abs(debt) },
      ctx,
    );

    if (novelSymbols.length > 0) {
      symbols.push(...novelSymbols);
      debt += novelSymbols.length;
    }
  }

  return symbols;
}
// // import { enums } from "@vivalence/schema";

// export default async function (body, ctx) {
//   const { scope, symbolIds, blacklist, take = 1 } = body;

//   let debt = -take;
//   const symbols = [];

//   if (debt < 0) {
//     const dueSymbols = await getDueSymbols({
//       scope,
//       symbolIds,
//       blacklist,
//       take: Math.abs(debt),
//       ctx,
//     });

//     if (dueSymbols.length > 0) {
//       symbols.push(...dueSymbols);
//       debt += dueSymbols.length;
//     }
//   }

//   if (debt < 0) {
//     const newSymbols = await getNewSymbols({
//       scope,
//       symbolIds,
//       blacklist,
//       take: Math.abs(debt),
//       ctx,
//     });

//     if (newSymbols.length > 0) {
//       symbols.push(...newSymbols);
//       debt += newSymbols.length;
//     }
//   }

//   return symbols;
// }

// async function getDueSymbols({ scope, symbolIds, blacklist, take, ctx }) {
//   try {
//     const user = await ctx.runtime.services.identity.getUser();

//     const qb = ctx.runtime.entities.em.createQueryBuilder(
//       ctx.runtime.entities.symbol,
//     );

//     qb.select("t.*").from("Symbol", "t").where({});

//     if (symbolIds && symbolIds.length > 0) {
//       qb.andWhere({ id: { $in: symbolIds } });
//     }

//     if (blacklist && blacklist.symbols && blacklist.symbols.length > 0) {
//       qb.andWhere({ id: { $nin: blacklist.symbols } });
//     }

//     qb.andWhere(
//       `EXISTS (
//         SELECT 1 FROM Play p
//         WHERE p.symbol = t.id
//         AND p.nextAt < ?
//         AND p.user = ?
// 	AND p.game = ?
// 	AND p.tactic = ?
// 	AND p.strategy = ?
//       )`,
//       [
//         new Date(),
//         user.id,
//         scope.game?.slug,
//         scope.tactic?.slug,
//         scope.strategy?.slug,
//       ],
//     );

//     qb.andWhere(
//       `NOT EXISTS (
//         SELECT 1 FROM Memory m
//         WHERE m.symbol = t.id
//         AND m.literal IS NULL
//         AND m.user = ?
//         AND m.status IN (?)
//       )`,
//       [user.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
//     );

//     // Apply limit
//     if (take) {
//       qb.limit(take);
//     }

//     // Execute query
//     const dueSymbols = await qb.getResult();
//     return dueSymbols;
//   } catch (error) {
//     console.error("Error fetching due symbols:", error);
//     throw error;
//   }
// }

// async function getNewSymbols({ scope, symbolIds, blacklist, take, ctx }) {
//   try {
//     const user = await ctx.runtime.services.identity.getUser();
//     // Build query for finding new symbols
//     const qb = ctx.runtime.entities.em.createQueryBuilder(
//       ctx.runtime.entities.symbol,
//     );

//     qb.select("t.*").from("Symbol", "t").where({});

//     // Apply symbol IDs filter if provided
//     if (symbolIds && symbolIds.length > 0) {
//       qb.andWhere({ id: { $in: symbolIds } });
//     }

//     // Apply blacklist filter if provided
//     if (blacklist && blacklist.symbols && blacklist.symbols.length > 0) {
//       qb.andWhere({ id: { $nin: blacklist.symbols } });
//     }

//     // Make sure symbol doesn't have a Play record for the game
//     qb.andWhere(
//       `NOT EXISTS (
//         SELECT 1 FROM Play p
//         WHERE p.symbol = t.id
//         AND p.user = ?
//         AND p.game = ?
//         AND p.tactic = ?
//         AND p.strategy = ?
//       )`,
//       [user.id, scope.game?.slug, scope.tactic?.slug, scope.strategy?.slug],
//     );

//     // Make sure symbol doesn't have a Memory with status KNOWN or GRADUATED
//     qb.andWhere(
//       `NOT EXISTS (
//         SELECT 1 FROM Memory m
//         WHERE m.symbol = t.id
//         AND m.literal IS NULL
//         AND m.user = ?
//         AND m.status IN (?)
//       )`,
//       [user.id, [enums.MemoryStatus.KNOWN, enums.MemoryStatus.GRADUATED]],
//     );

//     // Apply limit
//     if (take) {
//       qb.limit(take);
//     }

//     // Execute query
//     const newSymbols = await qb.getResult();
//     return newSymbols;
//   } catch (error) {
//     console.error("Error fetching new symbols:", error);
//     throw error;
//   }
// }
