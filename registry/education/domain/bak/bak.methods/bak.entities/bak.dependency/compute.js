import { Scope, Blacklist } from "@vivalence/shared";

export default async function ({ dependency, scope, ...input }, ctx) {
  try {
    const user = await ctx.runtime.services.identity.getUser();
    const computeScope = new Scope({
      ...scope,
      user: { id: user.id },
      dependency: { id: dependency.id },
    });

    const blacklist = new Blacklist(input.blacklist);

    // Get the dependency entity with its relationships
    const dependencyEntity =
      await ctx.runtime.entities.dependency.findOneOrFail(
        { id: dependency.id },
        {
          populate: [
            "conditions",
            "children",
            "parent",
            "tactic",
            "game",
            "instructions",
          ],
        },
      );

    // Compute dependency state and satisfaction
    const result = await computeDependencyState(
      dependencyEntity,
      computeScope,
      blacklist,
      ctx,
    );

    // Update dependency entity with computed values
    if (result.shouldUpdate) {
      ctx.runtime.entities.em.assign(dependencyEntity, {
        state: result.state,
        progress: result.progress,
        satisfied: result.satisfied,
        lastComputed: new Date(),
        metadata: result.metadata,
      });
      await ctx.runtime.entities.em.flush();
    }

    // Trigger cascade computation for parent dependencies if state changed
    if (result.stateChanged && dependencyEntity.parent) {
      await ctx.runtime.call("/entities/dependency/compute", {
        dependency: { id: dependencyEntity.parent.id },
        scope: computeScope,
        blacklist: input.blacklist,
      });
    }

    return {
      dependency: dependencyEntity,
      state: result.state,
      progress: result.progress,
      satisfied: result.satisfied,
      metadata: result.metadata,
      computedAt: new Date(),
      stateChanged: result.stateChanged,
    };
  } catch (error) {
    console.error("Error computing dependency:", error);
    throw error;
  }
}

async function computeDependencyState(dependency, scope, blacklist, ctx) {
  const previousState = dependency.state;

  // Compute based on dependency type
  const computeType = dependency.type || "condition_based";

  let result;
  switch (computeType) {
    case "condition_based":
      result = await computeConditionBasedDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
      break;
    case "instruction_based":
      result = await computeInstructionBasedDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
      break;
    case "hierarchy_based":
      result = await computeHierarchyBasedDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
      break;
    case "tactic_based":
      result = await computeTacticBasedDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
      break;
    case "composite":
      result = await computeCompositeDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
      break;
    default:
      result = await computeDefaultDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
  }

  result.stateChanged = previousState !== result.state;
  return result;
}

async function computeConditionBasedDependency(
  dependency,
  scope,
  blacklist,
  ctx,
) {
  try {
    if (!dependency.conditions || dependency.conditions.length === 0) {
      return {
        state: "satisfied",
        progress: 1.0,
        satisfied: true,
        metadata: { conditions: [] },
        shouldUpdate: true,
      };
    }

    // Compute all conditions
    const conditionResults = await Promise.all(
      dependency.conditions.map(async (condition) => {
        const result = await ctx.runtime.call("/entities/condition/compute", {
          condition: { id: condition.id },
          scope,
          blacklist,
        });
        return result;
      }),
    );

    // Determine overall satisfaction based on logic operator
    const logicOperator = dependency.config?.logicOperator || "AND";
    let satisfied, progress;

    if (logicOperator === "OR") {
      satisfied = conditionResults.some((r) => r.satisfied);
      progress = Math.max(...conditionResults.map((r) => r.progress));
    } else {
      // AND (default)
      satisfied = conditionResults.every((r) => r.satisfied);
      progress =
        conditionResults.length > 0
          ? conditionResults.reduce((sum, r) => sum + r.progress, 0) /
            conditionResults.length
          : 0;
    }

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        conditionResults: conditionResults.map((r) => ({
          conditionId: r.condition.id,
          satisfied: r.satisfied,
          progress: r.progress,
        })),
        logicOperator,
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing condition-based dependency:", error);
    throw error;
  }
}

async function computeInstructionBasedDependency(
  dependency,
  scope,
  blacklist,
  ctx,
) {
  try {
    // Count completed instructions for this dependency
    const completedInstructions = await ctx.runtime.entities.instruction.count({
      dependency: dependency.id,
      user: scope.user.id,
      status: "COMPLETED",
    });

    const totalInstructions = await ctx.runtime.entities.instruction.count({
      dependency: dependency.id,
      user: scope.user.id,
    });

    const progress =
      totalInstructions > 0 ? completedInstructions / totalInstructions : 0;
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        completedInstructions,
        totalInstructions,
        type: "instruction_based",
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing instruction-based dependency:", error);
    throw error;
  }
}

async function computeHierarchyBasedDependency(
  dependency,
  scope,
  blacklist,
  ctx,
) {
  try {
    if (!dependency.children || dependency.children.length === 0) {
      // Leaf node - compute based on its own conditions
      return await computeConditionBasedDependency(
        dependency,
        scope,
        blacklist,
        ctx,
      );
    }

    // Compute all children dependencies
    const childResults = await Promise.all(
      dependency.children.map(async (child) => {
        const result = await ctx.runtime.call("/entities/dependency/compute", {
          dependency: { id: child.id },
          scope,
          blacklist,
        });
        return result;
      }),
    );

    // Aggregate child results
    const satisfiedChildren = childResults.filter((r) => r.satisfied).length;
    const totalChildren = childResults.length;
    const progress = totalChildren > 0 ? satisfiedChildren / totalChildren : 0;
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        childResults: childResults.map((r) => ({
          dependencyId: r.dependency.id,
          satisfied: r.satisfied,
          progress: r.progress,
        })),
        satisfiedChildren,
        totalChildren,
        type: "hierarchy_based",
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing hierarchy-based dependency:", error);
    throw error;
  }
}

async function computeTacticBasedDependency(dependency, scope, blacklist, ctx) {
  try {
    if (!dependency.tactic) {
      throw new Error("Tactic-based dependency requires a tactic reference");
    }

    // Get tactic completion status
    const tactic = await ctx.runtime.entities.tactic.findOneOrFail(
      dependency.tactic.id,
    );

    // Check if tactic has been completed for this user
    const tacticPlays = await ctx.runtime.entities.play.count({
      tactic: tactic.id,
      user: scope.user.id,
      // Assuming completion is tracked via some status field
    });

    const requiredPlays = dependency.config?.requiredPlays || 1;
    const progress = Math.min(tacticPlays / requiredPlays, 1.0);
    const satisfied = progress >= 1.0;

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        tacticId: tactic.id,
        tacticPlays,
        requiredPlays,
        type: "tactic_based",
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing tactic-based dependency:", error);
    throw error;
  }
}

async function computeCompositeDependency(dependency, scope, blacklist, ctx) {
  try {
    const compositeConfig = dependency.config?.composite || {};
    const components = compositeConfig.components || [];

    if (components.length === 0) {
      return {
        state: "satisfied",
        progress: 1.0,
        satisfied: true,
        metadata: { components: [] },
        shouldUpdate: true,
      };
    }

    // Compute each component
    const componentResults = await Promise.all(
      components.map(async (component) => {
        switch (component.type) {
          case "condition":
            return await ctx.runtime.call("/entities/condition/compute", {
              condition: { id: component.id },
              scope,
              blacklist,
            });
          case "dependency":
            return await ctx.runtime.call("/entities/dependency/compute", {
              dependency: { id: component.id },
              scope,
              blacklist,
            });
          default:
            throw new Error(`Unknown component type: ${component.type}`);
        }
      }),
    );

    // Apply composite logic
    const logic = compositeConfig.logic || "AND";
    let satisfied, progress;

    if (logic === "OR") {
      satisfied = componentResults.some((r) => r.satisfied);
      progress = Math.max(...componentResults.map((r) => r.progress));
    } else if (logic === "WEIGHTED") {
      const weights = compositeConfig.weights || componentResults.map(() => 1);
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      progress =
        componentResults.reduce((sum, r, i) => {
          return sum + r.progress * weights[i];
        }, 0) / totalWeight;
      satisfied = progress >= (compositeConfig.threshold || 1.0);
    } else {
      // AND (default)
      satisfied = componentResults.every((r) => r.satisfied);
      progress =
        componentResults.length > 0
          ? componentResults.reduce((sum, r) => sum + r.progress, 0) /
            componentResults.length
          : 0;
    }

    return {
      state: satisfied ? "satisfied" : "pending",
      progress,
      satisfied,
      metadata: {
        componentResults: componentResults.map((r, i) => ({
          componentId: components[i].id,
          componentType: components[i].type,
          satisfied: r.satisfied,
          progress: r.progress,
        })),
        logic,
        type: "composite",
      },
      shouldUpdate: true,
    };
  } catch (error) {
    console.error("Error computing composite dependency:", error);
    throw error;
  }
}

async function computeDefaultDependency(dependency, scope, blacklist, ctx) {
  // Default computation based on simple state
  const state = dependency.state || "pending";
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
// import { strings } from "@vivalence/shared";

// // dependency = await ctx.runtime.call("/dependencies/compute", { dependency });
// export default async function (body, ctx) {
//   const dependency = await readDependency(body.dependency, ctx);

//   const [conditions, preconditions] = await Promise.all([
//     readCondition({ dependency, type: "condition" }, ctx),
//     readCondition({ dependency, type: "precondition" }, ctx),
//   ]);

//   dependency.conditions = conditions;
//   dependency.preconditions = preconditions;

//   dependency.available = dependency.preconditions.every((c) => c.met);
//   dependency.satisfied = dependency.conditions.every((c) => c.met);

//   await ctx.runtime.locals.supabase
//     .from("Dependency")
//     .update({
//       available: dependency.available,
//       satisfied: dependency.satisfied,
//       updatedAt: new Date().toISOString(),
//     })
//     .eq("id", dependency.id);

//   return dependency;
// }

// async function readDependency(dependency, ctx) {
//   if (!dependency?.id && !dependency.slug) throw new Error("dependency id or slug required");

//   let query = ctx.runtime.locals.supabase
//     .from("Dependency")
//     .select("*")
//     .eq("runtimeId", ctx.runtime.manifest.id);

//   if (dependency.id) query = query.eq("id", dependency.id);
//   if (dependency.slug) query = query.eq("slug", dependency.slug);

//   const { data, error } = await query.maybeSingle();

//   if (error && error.code !== "PGRST116") throw error;

//   if (!data) throw new Error("dependency not found");
//   return data;
// }

// async function readCondition({ type, dependency }, ctx) {
//   const { data, error } = await ctx.runtime.locals.supabase
//     .from(`_${strings.capitalize(type)}`)
//     .select("A,B")
//     .eq("B", dependency.id);

//   if (error) throw error;
//   if (!data) throw new Error("condition not found");

//   return await Promise.all(
//     data.map(({ A }) => ctx.runtime.call("/conditions/compute", { condition: { id: A } })),
//   );
// }
