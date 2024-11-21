import { deepEquals, deepMerge, strings } from "@vivalence/shared";

export default async function (body, ctx) {
  let { dependency } = body;
  let operation = null;

  if (!dependency.slug) throw new Error("Dependency slug is required", dependency);

  const existingDependency = await read(dependency, ctx);

  let data;
  if (existingDependency) {
    // data.dependency, data.operation
    data = await update({ new: dependency, old: existingDependency }, ctx);
  } else {
    data = await create(dependency, ctx);
  }
  dependency.id = data.dependency.id;

  const [conditions, preconditions] = await bruteForceConditions({ dependency }, ctx);

  dependency = await ctx.runtime.call("/dependencies/compute", { dependency });

  return {
    dependency: { ...dependency, conditions, preconditions },
    operation: data.operation,
    status: "success",
  };
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

  return dependency;
}

// this used to be smart but i fucking lost my fucking nerve. BUUUURRRNNNNNN
async function bruteForceConditions({ type, dependency }, ctx) {
  async function deleteOldConditions(type) {
    const oldRelations = await ctx.runtime.locals.supabase
      .from(`_${strings.capitalize(type)}`)
      .select("A,B")
      .eq(`B`, dependency.id);

    await ctx.runtime.locals.supabase
      .from("Condition")
      .delete()
      .in(
        "id",
        oldRelations.data.map((r) => r.A),
      );
  }
  await Promise.all(["condition", "precondition"].map(deleteOldConditions));

  async function createNewConditions(type) {
    return await Promise.all(
      dependency[type + "s"].map((condition) => {
        condition.corpusId = dependency.corpusId;
        return ctx.runtime.call("/conditions/install", { condition, type });
      }),
    );
  }

  const [conditions, preconditions] = await Promise.all(
    ["condition", "precondition"].map(createNewConditions),
  );

  async function createRelations(conditions) {
    return await Promise.all(
      conditions.map(({ type, condition }) =>
        ctx.runtime.locals.supabase
          .from(`_${strings.capitalize(type)}`)
          .upsert({ A: condition.id, B: dependency.id }, { onConflict: "A,B" })
          .select()
          .single(),
      ),
    );
  }

  const relations = await Promise.all([conditions, preconditions].map(createRelations));

  return [conditions, preconditions];
}

async function create(params, ctx) {
  let { conditions, preconditions, ...data } = params;

  const { data: dependency, error } = await ctx.runtime.locals.supabase
    .from("Dependency")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...data })
    .select("*")
    .single();

  if (error) throw error;

  return { dependency, operation: "create" };
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
    dependency,
  };
}
