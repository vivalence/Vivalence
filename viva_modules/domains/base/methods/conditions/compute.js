import { validator, deepEquals, deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  const condition = await read(body.condition, ctx);
  let met;

  if (condition.scope.tag) {
    let memories = [];
    const tag = await ctx.runtime.call("/tags/fromSlug", { slug: condition.scope.tag.slug });

    if (tag.traits.includes("LEARNABLE")) {
      const flavor = tag.data.LEARNABLE.flavor;
      if (flavor === "INDIVIDUAL") {
        const { data, error } = await ctx.runtime.locals.supabase
          .from("Memory")
          .select("id, tagId, unitId, status")
          .eq("tagId", tag.id)
          .is("unitId", null)
          .maybeSingle();
        if (error) throw error;
        memories.push(data?.status);
      } else if (flavor === "RELATIONAL") {
        const { data: relations } = await ctx.runtime.locals.supabase
          .from("_TagToUnit")
          .select("*")
          .eq("A", tag.id);

        const unitIds = relations.map((relation) => relation.B);
        const { data } = await ctx.runtime.locals.supabase
          .from("Memory")
          .select("id, tagId, unitId, status")
          .eq("tagId", tag.id)
          .in("unitId", unitIds);

        unitIds
          .map((unitId) => data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED")
          .map((status) => memories.push(status));
      }
    } else if (tag.traits.includes("COMPLETABLE")) {
      const flavor = tag.data.LEARNABLE.flavor;
      if (flavor === "INDIVIDUAL") {
        const { data: relations } = await ctx.runtime.locals.supabase
          .from("_TagToUnit")
          .select("*")
          .eq("A", tag.id);

        const unitIds = relations.map((relation) => relation.B);

        const { data } = await ctx.runtime.locals.supabase
          .from("Memory")
          .select("id, tagId, unitId, status")
          .in("unitId", unitIds)
          .is("tagId", null);

        unitIds
          .map((unitId) => data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED")
          .map((status) => memories.push(status));
      } else if (flavor === "RELATIONAL") {
        const { data: relations } = await ctx.runtime.locals.supabase
          .from("_TagToUnit")
          .select(
            "A, unit:Unit(id, memories:Memory(id, unitId, tagId, status), relations:_TagToUnit(A, B))",
          )
          .eq("A", tag.id);

        relations.map(({ unit }) =>
          unit.relations.map(({ A, B }) => {
            memories.push(
              unit.memories.find((memory) => memory.unitId === B && memory.tagId === A)?.status ||
                "UNTOUCHED",
            );
          }),
        );
      }
    }
    met = await validator.jsonata(condition.assertion.jsonata, memories);
  } else if (condition.scope.dependency) {
    const dependency = await ctx.runtime.call("/dependencies/compute", {
      dependency: condition.scope.dependency,
    });

    met = dependency.satisfied;
  }

  const { data } = await ctx.runtime.locals.supabase
    .from("Condition")
    .update({ met, updatedAt: new Date().toISOString() })
    .eq("id", condition.id)
    .select("id,met,updatedAt")
    .single();

  return { ...condition, ...data };
}

async function read(condition, ctx) {
  if (!condition?.id) throw new Error("Condition id is required");

  let query = ctx.runtime.locals.supabase
    .from("Condition")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", condition.id);

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (!data) throw new Error("Condition not found");
  return data;
}
