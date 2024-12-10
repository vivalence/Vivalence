import sort from "./sort.js";

// this must be further differentiated. related to /conditions/compute ie implements same logic.
export const getResourceMemory = (resourceType) => async (resource, ctx) => {
  const other = { Unit: "tag", Tag: "unit" };

  let query = ctx.runtime.locals.supabase
    .from(resourceType)
    .select(`id, Memory (id, tagId, unitId, type, state, status, lastAt)`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", resource.id)
    .filter(`Memory.${other[resourceType]}Id`, "is", null);

  if (resourceType === "Unit") query = query.order("index", { ascending: true });

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) throw error;

  resource.memory = data?.Memory[0];
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
