import { deepEquals, deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  let { dependency } = body;
  let operation = null;

  if (!dependency.slug) throw new Error("Dependency slug is required", dependency);

  const existingDependency = await read(dependency, ctx);
  // console.log("existingDependency", existingDependency);

  if (existingDependency) {
    const data = await update({ new: dependency, old: existingDependency }, ctx);
    operation = data.operation;
    dependency = data.dependency;
  } else {
    dependency = await create(dependency, ctx);
    operation = "create";
  }

  return { dependency, operation };
}

async function read({ id, slug }, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Dependency")
    .select(`id, slug, name, description, corpusId, itinerary `)
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (id) query = query.eq("id", id);
  else if (slug) query = query.eq("slug", slug);

  const { data: dependency, error } = await query.maybeSingle();
  if (error && error.code !== "PGRST116") throw error;

  if (dependency) {
    async function readCondition(type) {
      const { data, error } = await ctx.runtime.locals.supabase
        .from("Condition")
        .select()
        .eq(`${type}ForId`, dependency.id);
      if (error) throw error;
      return data;
    }
    const [conditions, preconditions] = await Promise.all([
      readCondition("condition"),
      readCondition("precondition"),
    ]);
    dependency.conditions = conditions;
    dependency.preconditions = preconditions;
  }

  return dependency;
}

async function handleConditions({ conditions, dependencyId }, ctx) {
  const remaining = [...(conditions.old || [])];
  const updated = [];

  for (const newCondition of conditions.new || []) {
    const matchIndex = remaining.findIndex((oldCondition) => {
      return deepEquals(
        {
          scope: newCondition.scope,
          assertion: newCondition.assertion,
          corpusId: newCondition.corpusId || null,
        },
        {
          scope: oldCondition.scope,
          assertion: oldCondition.assertion,
          corpusId: oldCondition.corpusId || null,
        },
      );
    });

    if (matchIndex !== -1) {
      updated.push({
        condition: remaining[matchIndex],
        operation: null,
      });
      remaining.splice(matchIndex, 1);
    } else {
      const installed = await ctx.runtime.call("/conditions/install", {
        condition: newCondition,
        type: conditions.type,
        dependencyId,
      });
      if (installed.error) throw installed.error;
      updated.push(installed);
    }
  }

  for (const { id } of remaining) {
    const removed = await ctx.runtime.call("/conditions/remove", { id });
  }

  return updated;
}

async function create(params, ctx) {
  let { conditions, preconditions, ...data } = params;

  const { data: dependency, error } = await ctx.runtime.locals.supabase
    .from("Dependency")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...data })
    .select("*")
    .single();

  if (error) throw error;

  conditions = await handleConditions(
    {
      conditions: { new: conditions, type: "condition" },
      dependencyId: dependency.id,
    },
    ctx,
  );
  preconditions = await handleConditions(
    {
      conditions: { new: preconditions, type: "precondition" },
      dependencyId: dependency.id,
    },
    ctx,
  );

  return { ...dependency, conditions, preconditions };
}

async function update(dependencies, ctx) {
  let dependency = {
    id: dependencies.old.id,
    itinerary: dependencies.old.itinerary,
    corpusId: dependencies.old.corpusId,
    name: dependencies.old.name,
    slug: dependencies.old.slug,
    description: dependencies.old.description,
  };
  let operation = null;

  const conditions = await handleConditions(
    {
      conditions: {
        new: dependencies.new.conditions,
        old: dependencies.old.conditions,
        type: "condition",
      },
      dependencyId: dependency.id,
    },
    ctx,
  );
  const preconditions = await handleConditions(
    {
      conditions: {
        new: dependencies.new.preconditions,
        old: dependencies.old.preconditions,
        type: "precondition",
      },
      dependencyId: dependency.id,
    },
    ctx,
  );

  const mergedDependency = deepMerge(dependency, {
    itinerary: dependencies.new.itinerary,
    corpusId: dependencies.new.corpusId,
    name: dependencies.new.name,
    slug: dependencies.new.slug,
    description: dependencies.new.description,
  });

  if (!deepEquals(mergedDependency, dependency)) {
    operation = "update";
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Dependency")
      .update({
        ...mergedDependency,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", dependencies.old.id)
      .select("*")
      .single();

    if (error) throw error;
    dependency = data;
  }
  return {
    operation,
    dependency: { ...dependency, conditions, preconditions },
  };
}
