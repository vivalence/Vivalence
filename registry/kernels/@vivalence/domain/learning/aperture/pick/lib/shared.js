import get from "./get.js";
import sort from "./sort.js";

export default (resourceType) => async (body, ctx) => {
  const { blacklist = {}, seek = {}, batch, stock } = body;
  const take = body.take || (batch || 0) + (stock || 0);
  let resources = body[resourceType + "s"] || [];

  if (resources.length === 0) {
    try {
      if (seek.symbols?.length > 0) {
        resources = await getResourcesBySymbolIds(resourceType, body, ctx);
      } else if (seek.literals?.length > 0) {
        resources = await getResourcesByLiteralIds(resourceType, body, ctx);
      }
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error);
      resources = [];
    }
  }

  if (blacklist[resourceType + "s"]?.length > 0) {
    resources = resources.filter(
      (r) => !blacklist[resourceType + "s"].includes(r.id),
    );
  }

  resources = Array.isArray(resources) ? resources : [];
  resources = await Promise.all(
    resources.map((r) => get[resourceType](r, ctx)),
  );
  resources = await sort(resources);

  return resources;
};

async function getResourcesBySymbolIds(resourceType, body, ctx) {
  const { seek, blacklist = {} } = body;
  const symbolIds = seek.symbols;

  if (!symbolIds || symbolIds.length === 0) {
    return [];
  }

  if (resourceType === "symbol") {
    return await ctx.daemon.entities.symbol.find({
      id: { $in: symbolIds },
      ...(blacklist.symbols?.length > 0
        ? { id: { $nin: blacklist.symbols } }
        : {}),
    });
  } else if (resourceType === "literal") {
    const placeholders = symbolIds.map(() => "?").join(",");
    const query =
      "SELECT DISTINCT sl.literal_entity_id as literal FROM symbol_literals sl WHERE sl.symbol_entity_id IN (" +
      placeholders +
      ") GROUP BY sl.literal_entity_id HAVING COUNT(DISTINCT sl.symbol_entity_id) = ?";

    const literalIds = await ctx.daemon.entities.em.execute(query, [
      ...symbolIds,
      symbolIds.length,
    ]);

    if (literalIds.length > 0) {
      return await ctx.daemon.entities.literal.find(
        {
          id: { $in: literalIds.map((l) => l.literal) },
          ...(blacklist.literals?.length > 0
            ? { id: { $nin: blacklist.literals } }
            : {}),
        },
        { populate: ["symbols"] },
      );
    }
  }

  return [];
}

async function getResourcesByLiteralIds(resourceType, body, ctx) {
  const { seek, blacklist = {} } = body;
  const literalIds = seek.literals;

  if (!literalIds || literalIds.length === 0) {
    return [];
  }

  if (resourceType === "literal") {
    return await ctx.daemon.entities.literal.find(
      {
        id: { $in: literalIds },
        ...(blacklist.literals?.length > 0
          ? { id: { $nin: blacklist.literals } }
          : {}),
      },
      { populate: ["symbols"] },
    );
  } else if (resourceType === "symbol") {
    const symbolIds = await ctx.daemon.entities.em
      .createQueryBuilder()
      .select("DISTINCT sl.symbol_entity_id as symbol")
      .from("symbol_literals", "sl")
      .where({ literal_entity_id: { $in: literalIds } })
      .execute("all");

    if (symbolIds.length > 0) {
      return await ctx.daemon.entities.symbol.find({
        id: { $in: symbolIds.map((s) => s.symbol) },
        ...(blacklist.symbols?.length > 0
          ? { id: { $nin: blacklist.symbols } }
          : {}),
      });
    }
  }

  return [];
}
// import get from "./get.js";
// import sort from "./sort.js";

// export default (resourceType) => async (body, ctx) => {
//   const { blacklist = {}, } = body;
//   let resources = body[resourceType + "s"] || [];

//   const take = body.take || (body.batch || 0) + (body.stock || 0);

//   if (resources.length === 0) {
//     try {
//       if (body.symbolIds?.length > 0) {
//         resources = await getResourcesBySymbolIds(resourceType, body, ctx);
//       } else if (body.literalIds?.length > 0) {
//         resources = await getResourcesByLiteralIds(resourceType, body, ctx);
//       }
//     } catch (error) {
//       console.error(`Error fetching ${resourceType}:`, error);
//       resources = [];
//     }
//   }

//   // Apply blacklist filtering
//   if (blacklist[resourceType]?.length > 0) {
//     resources = resources.filter(
//       (r) => !blacklist[resourceType].includes(r.id),
//     );
//   }

//   // Get memory for each resource and sort

//   resources = Array.isArray(resources) ? resources : [];
//   // console.log("resources pre get", resources);
//   resources = await Promise.all(
//     resources.map((r) => get[resourceType](r, ctx)),
//   );
//   resources = await sort(resources);

//   return resources;
// };

// // Get resources by symbol IDs
// async function getResourcesBySymbolIds(resourceType, body, ctx) {
//   const { symbolIds, blacklist = {} } = body;

//   if (!symbolIds || symbolIds.length === 0) {
//     return [];
//   }

//   if (resourceType === "symbol") {
//     // Directly fetch symbols by IDs
//     return await ctx.runtime.entities.symbol.find({
//       id: { $in: symbolIds },
//       ...(blacklist.symbols?.length > 0 ? { id: { $nin: blacklist.symbols } } : {}),
//     });
//   } else if (resourceType === "literal") {
//     // Find literals that have ALL specified symbols
//     const literalIds = await ctx.runtime.entities.em.execute(
//       `SELECT DISTINCT tu.literal_entity_id as literal
// 	FROM _SymbolToLiteral tu
// 	WHERE tu.symbol_entity_id IN (${symbolIds.map(() => "?").join(",")})
// 	GROUP BY tu.literal_entity_id
// 	HAVING COUNT(DISTINCT tu.symbol_entity_id) = ?`,
//       [...symbolIds, symbolIds.length],
//     );

//     // const literalIds = await ctx.runtime.entities.em .createQueryBuilder() .select("DISTINCT tu.literal_entity_id") .from("_SymbolToLiteral", "tu") .where({ symbol_entity_id: { $in: symbolIds } }) .groupBy("tu.literal_entity_id") .having("COUNT(DISTINCT tu.symbol_entity_id) = ?", [symbolIds.length]) .execute("all");
//     // const literalIds = await ctx.runtime.entities.em .createQueryBuilder() .select("DISTINCT tu.literal") .from("_SymbolToLiteral", "tu") .where({ symbol: { $in: symbolIds } }) .groupBy("tu.literal") .having("COUNT(DISTINCT tu.symbol) = ?", [symbolIds.length]) .execute("all");

//     if (literalIds.length > 0) {
//       return await ctx.runtime.entities.literal.find(
//         {
//           id: { $in: literalIds.map((u) => u.literal) },
//           ...(blacklist.literals?.length > 0
//             ? { id: { $nin: blacklist.literals } }
//             : {}),
//         },
//         { populate: ["symbols"] },
//       );
//     }
//   }

//   return [];
// }

// // Get resources by literal IDs
// async function getResourcesByLiteralIds(resourceType, body, ctx) {
//   const { literalIds, blacklist = {} } = body;

//   if (!literalIds || literalIds.length === 0) {
//     return [];
//   }

//   if (resourceType === "literal") {
//     // Directly fetch literals by IDs
//     return await ctx.runtime.entities.literal.find(
//       {
//         id: { $in: literalIds },
//         ...(blacklist.literals?.length > 0
//           ? { id: { $nin: blacklist.literals } }
//           : {}),
//       },
//       { populate: ["symbols"] },
//     );
//   } else if (resourceType === "symbol") {
//     // Find symbols associated with any of the specified literals
//     const symbolIds = await ctx.runtime.entities.em
//       .createQueryBuilder()
//       .select("DISTINCT tu.symbol")
//       .from("_SymbolToLiteral", "tu")
//       .where({ literal: { $in: literalIds } })
//       .execute("all");

//     if (symbolIds.length > 0) {
//       return await ctx.runtime.entities.symbol.find({
//         id: { $in: symbolIds.map((t) => t.symbol) },
//         ...(blacklist.symbols?.length > 0 ? { id: { $nin: blacklist.symbols } } : {}),
//       });
//     }
//   }

//   return [];
// }

// // import get from "./get.js";
// // import sort from "./sort.js";

// // export default (resourceType) => async (body, ctx) => {
// //   console.log(resourceType, body);
// //   const { blacklist, take } = body;
// //   let resources = body[resourceType];

// //   if (!resources) {
// //     const params = { blacklist };

// //     if (body.symbolIds) {
// //       params.symbolIds = body.symbolIds;
// //       resources = await ctx.runtime.call(`/${resourceType}/fromSymbolIds`, params);
// //     }
// //     if (body.literalIds) {
// //       params.literalIds = body.literalIds;
// //       resources = await ctx.runtime.call(`/${resourceType}/fromLiteralIds`, params);
// //     }
// //   }

// //   if (blacklist?.[resourceType]?.length > 0)
// //     resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));

// //   resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));

// //   resources = await sort(resources);

// //   return resources;
// // };

// // import get from "./get.js";
// // import sort from "./sort.js";

// // export default (resourceType) => async (body, ctx) => {
// //   const { blacklist = {}, take } = body;
// //   let resources = body[resourceType] || [];

// //   if (resources.length === 0) {
// //     try {
// //       if (body.symbolIds?.length > 0) {
// //         if (resourceType === "symbol") {
// //           resources = await ctx.runtime.entities.symbol.find({
// //             id: { $in: body.symbolIds },
// //             runtime: ctx.runtime.entity.id,
// //             ...(blacklist.symbols?.length > 0 ? { id: { $nin: blacklist.symbols } } : {}),
// //           });
// //         } else if (resourceType === "literal") {
// //           const literalIds = await ctx.runtime.entities.em
// //             .createQueryBuilder()
// //             .select("DISTINCT tu.literal")
// //             .from("_SymbolToLiteral", "tu")
// //             .where({ symbol: { $in: body.symbolIds } })
// //             .groupBy("tu.literal")
// //             .having("COUNT(DISTINCT tu.symbol) = ?", [body.symbolIds.length])
// //             .execute("all");

// //           if (literalIds.length > 0) {
// //             resources = await ctx.runtime.entities.literal.find(
// //               {
// //                 id: { $in: literalIds.map((u) => u.literal) },
// //                 ...(blacklist.literals?.length > 0 ? { id: { $nin: blacklist.literals } } : {}),
// //               },
// //               { populate: ["symbols"] },
// //             );
// //           }
// //         }
// //       } else if (body.literalIds?.length > 0) {
// //         if (resourceType === "literal") {
// //           resources = await ctx.runtime.entities.literal.find(
// //             {
// //               id: { $in: body.literalIds },
// //               ...(blacklist.literals?.length > 0 ? { id: { $nin: blacklist.literals } } : {}),
// //             },
// //             { populate: ["symbols"] },
// //           );
// //         } else if (resourceType === "symbol") {
// //           const symbolIds = await ctx.runtime.entities.em
// //             .createQueryBuilder()
// //             .select("DISTINCT tu.symbol")
// //             .from("_SymbolToLiteral", "tu")
// //             .where({ literal: { $in: body.literalIds } })
// //             .execute("all");

// //           if (symbolIds.length > 0) {
// //             resources = await ctx.runtime.entities.symbol.find({
// //               id: { $in: symbolIds.map((t) => t.symbol) },
// //               ...(blacklist.symbols?.length > 0 ? { id: { $nin: blacklist.symbols } } : {}),
// //             });
// //           }
// //         }
// //       }
// //     } catch (error) {
// //       console.error(`Error fetching ${resourceType}:`, error);
// //     }
// //   }

// //   // Apply blacklist filtering
// //   if (blacklist[resourceType]?.length > 0) {
// //     resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));
// //   }

// //   // Get memory for each resource and sort
// //   resources = Array.isArray(resources) ? resources : [];
// //   resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));
// //   resources = await sort(resources);

// //   return resources;
// // };
