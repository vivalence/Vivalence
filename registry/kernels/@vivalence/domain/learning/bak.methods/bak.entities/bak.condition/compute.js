import { Scope, Blacklist } from "@vivalence/shared";

export default async function ({ condition, scope, ...input }, ctx) {
  try {
    const user = await ctx.runtime.services.identity.getUser();
    const computeScope = new Scope({
      ...scope,
      user: { id: user.id },
      condition: { id: condition.id },
    });

    const blacklist = new Blacklist(input.blacklist);

    // Get the condition entity with its relationships
    const conditionEntity = await ctx.runtime.entities.condition.findOneOrFail(
      { id: condition.id },
      { populate: ["dependencies", "requirements"] },
    );

    // Compute condition state based on its type and configuration
    const result = await computeConditionState(
      conditionEntity,
      computeScope,
      blacklist,
      ctx,
    );

    // Update condition entity with computed values if needed
    if (result.shouldUpdate) {
      ctx.runtime.entities.em.assign(conditionEntity, {
        state: result.state,
        progress: result.progress,
        lastComputed: new Date(),
        metadata: result.metadata,
      });
      await ctx.runtime.entities.em.flush();
    }

    return {
      condition: conditionEntity,
      state: result.state,
      progress: result.progress,
      satisfied: result.satisfied,
      metadata: result.metadata,
      computedAt: new Date(),
    };
  } catch (error) {
    console.error("Error computing condition:", error);
    throw error;
  }
}

async function computeConditionState(condition, scope, blacklist, ctx) {
  const computeType = condition.type || "default";

  switch (computeType) {
    case "memory_based":
      return await computeMemoryBasedCondition(
        condition,
        scope,
        blacklist,
        ctx,
      );
    case "count_based":
      return await computeCountBasedCondition(condition, scope, blacklist, ctx);
    case "time_based":
      return await computeTimeBasedCondition(condition, scope, blacklist, ctx);
    case "dependency_based":
      return await computeDependencyBasedCondition(
        condition,
        scope,
        blacklist,
        ctx,
      );
    default:
      return await computeDefaultCondition(condition, scope, blacklist, ctx);
  }
}

async function computeMemoryBasedCondition(condition, scope, blacklist, ctx) {
  try {
    const config = condition.config || {};
    const requiredStatus = config.requiredStatus || ["KNOWN", "GRADUATED"];

    // Count memories matching the condition criteria
    const criteria = {
      user: scope.user.id,
      status: { $in: requiredStatus },
    };

    // Apply condition-specific filters
    if (condition.unitIds?.length > 0) {
      criteria.unit = { $in: condition.unitIds };
    }

    if (condition.tagIds?.length > 0) {
      criteria.tag = { $in: condition.tagIds };
    }

    // Apply blacklist
    if (blacklist.memories?.length > 0) {
      criteria.id = { $nin: blacklist.memories };
    }

    const memoryCount = await ctx.runtime.entities.memory.count(criteria);
    const targetCount = config.targetCount || 1;

    const progress = Math.min(memoryCount / targetCount, 1.0);
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        currentCount: memoryCount,
        targetCount,
        requiredStatus,
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing memory-based condition:", error);
    throw error;
  }
}

async function computeCountBasedCondition(condition, scope, blacklist, ctx) {
  try {
    const config = condition.config || {};
    const entityType = config.entityType || "unit";
    const targetCount = config.targetCount || 1;

    let criteria = {};

    // Apply entity-specific filters based on condition configuration
    if (condition.filters) {
      criteria = { ...criteria, ...condition.filters };
    }

    // Apply blacklist based on entity type
    const blacklistKey = `${entityType}s`;
    if (blacklist[blacklistKey]?.length > 0) {
      criteria.id = { $nin: blacklist[blacklistKey] };
    }

    const entityCount = await ctx.runtime.entities[entityType].count(criteria);
    const progress = Math.min(entityCount / targetCount, 1.0);
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        entityType,
        currentCount: entityCount,
        targetCount,
        criteria,
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing count-based condition:", error);
    throw error;
  }
}

async function computeTimeBasedCondition(condition, scope, blacklist, ctx) {
  try {
    const config = condition.config || {};
    const startTime = new Date(config.startTime || condition.createdAt);
    const duration = config.duration || 3600000; // 1 hour default
    const currentTime = new Date();

    const elapsed = currentTime.getTime() - startTime.getTime();
    const progress = Math.min(elapsed / duration, 1.0);
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        startTime,
        duration,
        elapsed,
        remainingTime: Math.max(duration - elapsed, 0),
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing time-based condition:", error);
    throw error;
  }
}

async function computeDependencyBasedCondition(
  condition,
  scope,
  blacklist,
  ctx,
) {
  try {
    const config = condition.config || {};
    const requiredDependencies = config.dependencies || [];

    if (requiredDependencies.length === 0) {
      return {
        state: "satisfied",
        progress: 1.0,
        satisfied: true,
        metadata: { requiredDependencies: [] },
        shouldUpdate: true,
      };
    }

    // Check each required dependency
    const dependencyResults = await Promise.all(
      requiredDependencies.map(async (depId) => {
        const dependency = await ctx.runtime.entities.dependency.findOne({
          id: depId,
        });

        if (!dependency) return false;

        // Recursively compute dependency state if needed
        const depResult = await ctx.runtime.call(
          "/entities/dependency/compute",
          {
            dependency: { id: dependency.id },
            scope,
            blacklist: blacklist,
          },
        );

        return depResult.satisfied;
      }),
    );

    const satisfiedCount = dependencyResults.filter(Boolean).length;
    const progress = satisfiedCount / requiredDependencies.length;
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        requiredDependencies,
        satisfiedCount,
        dependencyResults,
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing dependency-based condition:", error);
    throw error;
  }
}

async function computeDefaultCondition(condition, scope, blacklist, ctx) {
  // Default computation - simple state check
  const state = condition.state || "pending";
  const satisfied = state === "satisfied";

  return {
    state,
    progress: satisfied ? 1.0 : 0.0,
    satisfied,
    metadata: {
      type: "default",
      computed: true,
    },
    shouldUpdate: false,
  };
}
// import pg from "pg";
// import { validators, deepEquals, deepMerge, monads } from "@vivalence/shared";

// export default async function (body, ctx) {
//   const user = await ctx.runtime.services.identity.getUser();

//   const condition = await read(body.condition, ctx);

//   const met = await conditionResolver(condition, ctx);
//   // This might blow up in the future. probably when the first memories run through here
//   // hello future me, if you're reading this, you're welcome.
//   // Fuck you past me, all you had to do was not hardcode a fucking  // met = false;
//   // But otherwise this doesnt seem entirely unreasonable.

//   const { data } = await ctx.runtime.services.supabase
//     .from("Condition")
//     .update({ met, updatedAt: new Date().toISOString() })
//     .eq("id", condition.id)
//     .select("id,met,updatedAt")
//     .single();

//   return { ...condition, ...data };
// }

// async function read(condition, ctx) {
//   if (!condition?.id) throw new Error("Condition id is required");

//   let query = ctx.runtime.services.supabase
//     .from("Condition")
//     .select("*")
//     .eq("runtimeId", ctx.runtime.manifest.id)
//     .eq("id", condition.id);

//   const { data, error } = await query.maybeSingle();

//   if (error && error.code !== "PGRST116") throw error;

//   if (!data) throw new Error("Condition not found");
//   return data;
// }

// // related to /pick/get ie implements same logic.
// async function conditionResolver(condition, ctx) {
//   let met;

//   if (condition.scope.tag) {
//     const tag = await ctx.runtime.call("/tags/fromSlug", {
//       slug: condition.scope.tag.slug,
//     });

//     const traits = tag.traits;
//     const type = tag.data.LEARNABLE?.type || tag.data.COMPLETABLE?.type;

//     let memories = [];
//     if (traits.includes("LEARNABLE") && type === "INDIVIDUAL") {
//       memories = await learnableIndividual({ tag }, ctx);
//     } else if (traits.includes("LEARNABLE") && type === "RELATIONAL") {
//       memories = await learnableRelational({ tag }, ctx);
//     } else if (tag.traits.includes("COMPLETABLE") && type === "INDIVIDUAL") {
//       memories = await completableIndividual({ tag }, ctx);
//     } else if (tag.traits.includes("COMPLETABLE") && type === "RELATIONAL") {
//       memories = await completableRelational({ tag }, ctx);
//     }

//     met = await validators.jsonata(condition.assertion.jsonata, memories);
//   } else if (condition.scope.dependency) {
//     const dependency = await ctx.runtime.call(
//       "/dependencies/compute",
//       condition.scope,
//     );
//     met = dependency.satisfied;
//   }

//   return met;
// }

// async function learnableIndividual({ tag }, ctx) {
//   let memories = [];
//   const { data, error } = await ctx.runtime.services.supabase
//     .from("Memory")
//     .select("id, tagId, unitId, status")
//     .eq("tagId", tag.id)
//     .is("unitId", null)
//     .maybeSingle();
//   if (error) throw error;
//   memories.push(data?.status || "UNTOUCHED");
//   return memories;
// }
// async function learnableRelational({ tag }, ctx) {
//   const user = await ctx.runtime.services.identity.getUser();

//   let memories = [];
//   const { data: relations } = await ctx.runtime.services.supabase
//     .from("_TagToUnit")
//     .select("*")
//     .eq("A", tag.id);

//   const unitIds = relations.map((relation) => relation.B);

//   const { rows: data } = await ctx.runtime.services.db.sql(
//     `WITH unit_ids AS (SELECT UNNEST($1::text[]) AS unit_id)
// SELECT id, "userId", "tagId", "unitId", status
// FROM "Memory"
// WHERE "tagId" = $2
// AND "userId" = $3
// AND "unitId" IN (SELECT unit_id FROM unit_ids); `,

//     [unitIds, tag.id, user.id],
//   );

//   unitIds
//     .map(
//       (unitId) =>
//         data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED",
//     )
//     .map((status) => memories.push(status || "UNTOUCHED"));

//   return memories;
// }

// async function completableIndividual({ tag }, ctx) {
//   const user = await ctx.runtime.services.identity.getUser();

//   let memories = [];
//   const { data: relations } = await ctx.runtime.services.supabase
//     .from("_TagToUnit")
//     .select("*")
//     .eq("A", tag.id);

//   const unitIds = relations.map((relation) => relation.B);

//   const { rows: data } = await ctx.runtime.services.db.sql(
//     `WITH unit_ids AS (SELECT UNNEST($1::text[]) AS unit_id)
// SELECT id, "userId", "tagId", "unitId", status
// FROM "Memory"
// WHERE "tagId" = $2
// AND "userId" = $3
// AND "unitId" IN (SELECT unit_id FROM unit_ids); `,

//     [unitIds, tag.id, user.id],
//   );

//   unitIds
//     .map(
//       (unitId) =>
//         data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED",
//     )
//     .map((status) => memories.push(status || "UNTOUCHED"));

//   return memories;
// }
// async function completableRelational({ tag }, ctx) {
//   let memories = [];

//   const { data: relations } = await ctx.runtime.services.supabase
//     .from("_TagToUnit")
//     .select(
//       "A, unit:Unit(id, memories:Memory(id, unitId, tagId, status), relations:_TagToUnit(A, B))",
//     )
//     .eq("A", tag.id);

//   relations.map(({ unit }) =>
//     unit.relations.map(({ A, B }) => {
//       memories.push(
//         unit.memories.find(
//           (memory) => memory.unitId === B && memory.tagId === A,
//         )?.status || "UNTOUCHED",
//       );
//     }),
//   );

//   return memories;
// }
