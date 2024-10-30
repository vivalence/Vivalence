import { deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  const { data: tag, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select(`id, data, traits, relations:_TagToUnit(*), memories:Memory(id,unitId,tagId,status)`)
    .eq("id", body.tag.id)
    .contains("traits", ["LEARNABLE"])
    .eq("data->LEARNABLE->>flavor", "RELATIONAL")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!tag) throw new Error("Tag not found");

  if (tag.memories.find(({ unitId, TagId }) => !unitId && !!tagId))
    throw new Error("Invalid INDIVIDUAL Memory on RELATIONAL Tag");

  const LEARNABLE = tag.memories.reduce(
    (acc, memory) => ((acc[memory.status] = (acc[memory.status] || 0) + 1), acc),
    { UNTOUCHED: tag.relations.length - tag.memories.length, updatedAt: new Date() },
  );

  const { data: update, error: err } = await ctx.runtime.locals.supabase
    .from("Tag")
    .update({ data: deepMerge(tag.data, { LEARNABLE }), updatedAt: new Date() })
    .eq("id", tag.id)
    .select("id,data,traits")
    .single();

  return update;
}
