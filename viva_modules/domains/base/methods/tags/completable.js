import { deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  const { data: tag, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select(`id,data,traits, relations:_TagToUnit(Unit(id, Memory(id,unitId,tagId,status)))`)
    .eq("id", body.tag.id)
    .contains("traits", ["COMPLETABLE"])
    .single();

  if (error) throw error;

  const COMPLETABLE = tag.relations
    .map((r) => r.Unit)
    .map((unit) => ((unit.memory = unit.Memory.find((m) => !m.tagId)), unit))
    .reduce(
      (completion, unit) => {
        const type = unit.memory?.status || "UNTOUCHED";
        completion[type] = (completion[type] || 0) + 1;
        return completion;
      },
      { _updatedAt: new Date() },
    );

  const { data: update, error: err } = await ctx.runtime.locals.supabase
    .from("Tag")
    .update({ data: deepMerge(tag.data, { COMPLETABLE }) })
    .eq("id", tag.id)
    .select("id,data,traits,updatedAt")
    .single();

  return update;
}
