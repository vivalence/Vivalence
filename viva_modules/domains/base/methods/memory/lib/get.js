export const getResourceMemory = (resourceType) => async (resource, ctx) => {
  const other = { Unit: "tag", Tag: "unit" };

  const { data, error } = await ctx.runtime.locals.supabase
    .from(resourceType)
    .select(`id, Memory (id, tagId, unitId, state, status, lastAt)`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", resource.id)
    .filter(`Memory.${other[resourceType]}Id`, "is", null)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  resource = { ...resource, memory: data?.Memory[0] };
  delete resource.Memory;

  return resource;
};

export const getTagMemory = getResourceMemory("Tag");
export const getUnitMemory = getResourceMemory("Unit");

export default {
  tag: getTagMemory,
  unit: getUnitMemory,
  tags: getTagMemory,
  units: getUnitMemory,
};
