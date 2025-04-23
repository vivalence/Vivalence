import get from "./get.js";
import sort from "./sort.js";

export default (resourceType) => async (body, ctx) => {
  // console.log("resources", resourceType, body);
  const { blacklist = {}, take } = body;
  let resources = body[resourceType + "s"] || [];

  if (resources.length === 0) {
    try {
      if (body.tagIds?.length > 0) {
        resources = await getResourcesByTagIds(resourceType, body, ctx);
      } else if (body.unitIds?.length > 0) {
        resources = await getResourcesByUnitIds(resourceType, body, ctx);
      }
    } catch (error) {
      console.error(`Error fetching ${resourceType}:`, error);
      resources = [];
    }
  }

  // Apply blacklist filtering
  if (blacklist[resourceType]?.length > 0) {
    resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));
  }

  // Get memory for each resource and sort
  resources = Array.isArray(resources) ? resources : [];
  resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));
  resources = await sort(resources);

  return resources;
};

// Get resources by tag IDs
async function getResourcesByTagIds(resourceType, body, ctx) {
  const { tagIds, blacklist = {} } = body;

  if (!tagIds || tagIds.length === 0) {
    return [];
  }

  if (resourceType === "tag") {
    // Directly fetch tags by IDs
    return await ctx.runtime.entities.tag.find({
      id: { $in: tagIds },
      runtime: ctx.runtime.entity.id,
      ...(blacklist.tags?.length > 0 ? { id: { $nin: blacklist.tags } } : {}),
    });
  } else if (resourceType === "unit") {
    // Find units that have ALL specified tags
    const unitIds = await ctx.runtime.entities.em
      .createQueryBuilder()
      .select("DISTINCT tu.unit")
      .from("_TagToUnit", "tu")
      .where({ tag: { $in: tagIds } })
      .groupBy("tu.unit")
      .having("COUNT(DISTINCT tu.tag) = ?", [tagIds.length])
      .execute("all");

    if (unitIds.length > 0) {
      return await ctx.runtime.entities.unit.find(
        {
          id: { $in: unitIds.map((u) => u.unit) },
          runtime: ctx.runtime.entity.id,
          ...(blacklist.units?.length > 0 ? { id: { $nin: blacklist.units } } : {}),
        },
        { populate: ["tags"] },
      );
    }
  }

  return [];
}

// Get resources by unit IDs
async function getResourcesByUnitIds(resourceType, body, ctx) {
  const { unitIds, blacklist = {} } = body;

  if (!unitIds || unitIds.length === 0) {
    return [];
  }

  if (resourceType === "unit") {
    // Directly fetch units by IDs
    return await ctx.runtime.entities.unit.find(
      {
        id: { $in: unitIds },
        runtime: ctx.runtime.entity.id,
        ...(blacklist.units?.length > 0 ? { id: { $nin: blacklist.units } } : {}),
      },
      { populate: ["tags"] },
    );
  } else if (resourceType === "tag") {
    // Find tags associated with any of the specified units
    const tagIds = await ctx.runtime.entities.em
      .createQueryBuilder()
      .select("DISTINCT tu.tag")
      .from("_TagToUnit", "tu")
      .where({ unit: { $in: unitIds } })
      .execute("all");

    if (tagIds.length > 0) {
      return await ctx.runtime.entities.tag.find({
        id: { $in: tagIds.map((t) => t.tag) },
        runtime: ctx.runtime.entity.id,
        ...(blacklist.tags?.length > 0 ? { id: { $nin: blacklist.tags } } : {}),
      });
    }
  }

  return [];
}

// import get from "./get.js";
// import sort from "./sort.js";

// export default (resourceType) => async (body, ctx) => {
//   console.log(resourceType, body);
//   const { blacklist, take } = body;
//   let resources = body[resourceType];

//   if (!resources) {
//     const params = { blacklist };

//     if (body.tagIds) {
//       params.tagIds = body.tagIds;
//       resources = await ctx.runtime.call(`/${resourceType}/fromTagIds`, params);
//     }
//     if (body.unitIds) {
//       params.unitIds = body.unitIds;
//       resources = await ctx.runtime.call(`/${resourceType}/fromUnitIds`, params);
//     }
//   }

//   if (blacklist?.[resourceType]?.length > 0)
//     resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));

//   resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));

//   resources = await sort(resources);

//   return resources;
// };

// import get from "./get.js";
// import sort from "./sort.js";

// export default (resourceType) => async (body, ctx) => {
//   const { blacklist = {}, take } = body;
//   let resources = body[resourceType] || [];

//   if (resources.length === 0) {
//     try {
//       if (body.tagIds?.length > 0) {
//         if (resourceType === "tag") {
//           resources = await ctx.runtime.entities.tag.find({
//             id: { $in: body.tagIds },
//             runtime: ctx.runtime.entity.id,
//             ...(blacklist.tags?.length > 0 ? { id: { $nin: blacklist.tags } } : {}),
//           });
//         } else if (resourceType === "unit") {
//           const unitIds = await ctx.runtime.entities.em
//             .createQueryBuilder()
//             .select("DISTINCT tu.unit")
//             .from("_TagToUnit", "tu")
//             .where({ tag: { $in: body.tagIds } })
//             .groupBy("tu.unit")
//             .having("COUNT(DISTINCT tu.tag) = ?", [body.tagIds.length])
//             .execute("all");

//           if (unitIds.length > 0) {
//             resources = await ctx.runtime.entities.unit.find(
//               {
//                 id: { $in: unitIds.map((u) => u.unit) },
//                 ...(blacklist.units?.length > 0 ? { id: { $nin: blacklist.units } } : {}),
//               },
//               { populate: ["tags"] },
//             );
//           }
//         }
//       } else if (body.unitIds?.length > 0) {
//         if (resourceType === "unit") {
//           resources = await ctx.runtime.entities.unit.find(
//             {
//               id: { $in: body.unitIds },
//               ...(blacklist.units?.length > 0 ? { id: { $nin: blacklist.units } } : {}),
//             },
//             { populate: ["tags"] },
//           );
//         } else if (resourceType === "tag") {
//           const tagIds = await ctx.runtime.entities.em
//             .createQueryBuilder()
//             .select("DISTINCT tu.tag")
//             .from("_TagToUnit", "tu")
//             .where({ unit: { $in: body.unitIds } })
//             .execute("all");

//           if (tagIds.length > 0) {
//             resources = await ctx.runtime.entities.tag.find({
//               id: { $in: tagIds.map((t) => t.tag) },
//               ...(blacklist.tags?.length > 0 ? { id: { $nin: blacklist.tags } } : {}),
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error(`Error fetching ${resourceType}:`, error);
//     }
//   }

//   // Apply blacklist filtering
//   if (blacklist[resourceType]?.length > 0) {
//     resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));
//   }

//   // Get memory for each resource and sort
//   resources = Array.isArray(resources) ? resources : [];
//   resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));
//   resources = await sort(resources);

//   return resources;
// };
