async function ensureVerbTagConnection({ unit, annotation }, ctx) {
  const { data: tag } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("data->ONTOLOGICAL->>branch", "lemma")
    .eq("data->ONTOLOGICAL->>leaf", annotation.lemma)
    .single();

  if (!tag) {
    return {
      message: "tag is missing.",
      path: ["tag"],
      violation: "required",
      context: { unit, annotation },
    };
  }

  const { data: connection } = await ctx.runtime.locals.supabase
    .from("_TagToUnit")
    .select("*")
    .eq("A", tag.id)
    .eq("B", unit.id)
    .single();

  return !!connection
    ? null
    : {
        message: "unit is not connected to its lemma tag.",
        path: ["unit", "tag"],
        violation: "required",
        context: { unit, test: { required: { branch: "lemma", leaf: unit.lemma } } },
      };
}

async function getUnits(annotation, ctx) {
  let query = ctx.runtime.locals.supabase.from("Unit").select("*");

  for (const [branch, leaf] of Object.entries(annotation)) {
    if (typeof leaf === "string") query = query.eq(`data->annotation->>${branch}`, leaf);
    else if (leaf === null || leaf === undefined || leaf === false) {
      query = query.filter(`data->annotation->>${branch}`, "is", null);
    } else throw new Error("invalid leaf type");
  }

  const { data: units, error } = await query.order("updatedAt", { ascending: true });
  if (error) throw error;
  return units;
}

export default async function ({ annotations }, ctx) {
  const issues = [];
  annotations = annotations.filter((annotation) => {
    if (!annotation.pos) return false;
    else if (["verb", "noun"].includes(annotation.pos)) return !!annotation.lemma;
    else return true;
  });
  for (const [i, annotation] of annotations.entries()) {
    const units = await getUnits(annotation, ctx);
    if (!units || units.length === 0) {
      issues.push({
        message: "unit missing.",
        path: ["unit"],
        violation: "required",
        context: { annotation },
      });
    } else if (units.length === 1) {
      if (annotation.lemma && ["verb", "aux"].includes(annotation.pos)) {
        const issue = await ensureVerbTagConnection({ unit: units[0], annotation }, ctx);
        if (issue) issues.push(issue);
      }
    } else if (units.length >= 2) {
      const [unit] = units.splice(0, 1);
      issues.push({
        message: "Multiple units for the same annotation found. This one will be cleaned.",
        path: ["unit"],
        violation: "invalid",
        context: { unit, annotation },
      });
      units.map((unit) => {
        issues.push({
          message: "Multiple units for the same annotation found. This one will be deleted.",
          path: ["unit"],
          violation: "forbidden",
          context: { unit, annotation },
        });
      });
    }
  }

  return issues;
}
