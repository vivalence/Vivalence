import sort from "./sort.js";

// this must be further differentiated. related to /conditions/compute ie implements same logic.
export const getResourceMemory = (resourceType) => async (resource, ctx) => {
  const other = { Unit: "tag", Tag: "unit" };

  if (resourceType === "Tag" && resource.data?.LEARNABLE?.flavor === "RELATIONAL") {
    const { data, error } = await ctx.runtime.locals.supabase
      .from(resourceType)
      .select(`id, Memory (id, tagId, unitId, type, state, status, lastAt)`)
      .eq("runtimeId", ctx.runtime.manifest.id)
      .eq("id", resource.id)
      .limit(1)
      .maybeSingle();
    if (error || !data) throw error || new Error("Resource not found");
    const [memory] = await sort(data.Memory.map((memory) => ({ id: data.id, memory })));
    resource = { ...resource, memory: memory?.memory };
  } else {
    const { data, error } = await ctx.runtime.locals.supabase
      .from(resourceType)
      .select(`id, Memory (id, tagId, unitId, type, state, status, lastAt)`)
      .eq("runtimeId", ctx.runtime.manifest.id)
      .eq("id", resource.id)
      .filter(`Memory.${other[resourceType]}Id`, "is", null)
      .order("data->>index", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    resource = { ...resource, memory: data?.Memory[0] };
  }

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
