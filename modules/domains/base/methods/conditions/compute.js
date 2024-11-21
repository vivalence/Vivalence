import { validator, deepEquals, deepMerge, monads } from "@vivalence/shared";

export default async function (body, ctx) {
  const condition = await read(body.condition, ctx);

  const met = await conditionResolver(condition, ctx);

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

async function conditionResolver(condition, ctx) {
  let met;

  if (condition.scope.tag) {
    const tag = await ctx.runtime.call("/tags/fromSlug", { slug: condition.scope.tag.slug });

    const traits = tag.traits;
    const flavor = tag.data.LEARNABLE?.flavor || tag.data.COMPLETABLE?.flavor;

    let memories = [];
    if (traits.includes("LEARNABLE") && flavor === "INDIVIDUAL") {
      const { data, error } = await ctx.runtime.locals.supabase
        .from("Memory")
        .select("id, tagId, unitId, status")
        .eq("tagId", tag.id)
        .is("unitId", null)
        .maybeSingle();
      if (error) throw error;
      memories.push(data?.status);
    } else if (traits.includes("LEARNABLE") && flavor === "RELATIONAL") {
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
    } else if (tag.traits.includes("COMPLETABLE") && flavor === "INDIVIDUAL") {
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
    } else if (tag.traits.includes("COMPLETABLE") && flavor === "RELATIONAL") {
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
    met = await validator.jsonata(condition.assertion.jsonata, memories);
  } else if (condition.scope.dependency) {
    const dependency = await ctx.runtime.call("/dependencies/compute", condition.scope);
    met = dependency.satisfied;
  }

  return met;
}

// import { Result, resultify, tryCatchAsync, sequence } from './ResultModule.js';

// const getTag = resultify((ctx, slug) => ctx.runtime.call("/tags/fromSlug", { slug }));

// const getMemories = async (ctx, tag) => {
//   const { traits, data } = tag;
//   const flavor = data.LEARNABLE?.flavor || data.COMPLETABLE?.flavor;

//   if (traits.includes("LEARNABLE")) {
//     return flavor === "INDIVIDUAL"
//       ? getIndividualLearnableMemories(ctx, tag)
//       : getRelationalLearnableMemories(ctx, tag);
//   } else if (traits.includes("COMPLETABLE")) {
//     return flavor === "INDIVIDUAL"
//       ? getIndividualCompletableMemories(ctx, tag)
//       : getRelationalCompletableMemories(ctx, tag);
//   }

//   return Result.failure(new Error("Unsupported tag type"));
// };

// const getIndividualLearnableMemories = resultify(async (ctx, tag) => {
//   const { data, error } = await ctx.runtime.locals.supabase
//     .from("Memory")
//     .select("id, tagId, unitId, status")
//     .eq("tagId", tag.id)
//     .is("unitId", null)
//     .maybeSingle();
//   if (error) throw error;
//   return [data?.status];
// });

// const getRelationalLearnableMemories = resultify(async (ctx, tag) => {
//   const { data: relations, error: relationsError } = await ctx.runtime.locals.supabase
//     .from("_TagToUnit")
//     .select("*")
//     .eq("A", tag.id);
//   if (relationsError) throw relationsError;

//   const unitIds = relations.map((relation) => relation.B);
//   const { data, error } = await ctx.runtime.locals.supabase
//     .from("Memory")
//     .select("id, tagId, unitId, status")
//     .eq("tagId", tag.id)
//     .in("unitId", unitIds);
//   if (error) throw error;

//   return unitIds.map((unitId) =>
//     data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED"
//   );
// });

// const getIndividualCompletableMemories = resultify(async (ctx, tag) => {
//   const { data: relations, error: relationsError } = await ctx.runtime.locals.supabase
//     .from("_TagToUnit")
//     .select("*")
//     .eq("A", tag.id);
//   if (relationsError) throw relationsError;

//   const unitIds = relations.map((relation) => relation.B);
//   const { data, error } = await ctx.runtime.locals.supabase
//     .from("Memory")
//     .select("id, tagId, unitId, status")
//     .in("unitId", unitIds)
//     .is("tagId", null);
//   if (error) throw error;

//   return unitIds.map((unitId) =>
//     data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED"
//   );
// });

// const getRelationalCompletableMemories = resultify(async (ctx, tag) => {
//   const { data: relations, error } = await ctx.runtime.locals.supabase
//     .from("_TagToUnit")
//     .select(
//       "A, unit:Unit(id, memories:Memory(id, unitId, tagId, status), relations:_TagToUnit(A, B))"
//     )
//     .eq("A", tag.id);
//   if (error) throw error;

//   return relations.flatMap(({ unit }) =>
//     unit.relations.map(({ A, B }) =>
//       unit.memories.find((memory) => memory.unitId === B && memory.tagId === A)?.status || "UNTOUCHED"
//     )
//   );
// });

// const validateMemories = resultify((validator, condition, memories) =>
//   validator.jsonata(condition.assertion.jsonata, memories)
// );

// // Main function
// async function processTag(ctx, condition, validator) {
//   return await getTag(ctx, condition.scope.tag.slug)
//     .flatMap(tag => getMemories(ctx, tag))
//     .flatMap(memories => validateMemories(validator, condition, memories));
// }

// // Usage
// export async function handler(ctx) {
//   const { condition, validator } = ctx.req.param();
//   const result = await processTag(ctx, condition, validator);

//   if (result.isFailure()) {
//     console.error(result.value);
//     return ctx.json({ error: result.value.message }, 500);
//   }

//   return ctx.json({ met: result.value }, 200);
// }
