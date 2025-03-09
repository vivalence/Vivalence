import sort from "./sort.js";

// Migrated to use MikroORM entities instead of Supabase
export const getResourceMemory = (resourceType) => async (resource, ctx) => {
  const resourceEntityName = resourceType.toLowerCase();
  const other = { Unit: "tag", Tag: "unit" };
  const otherEntityName = other[resourceType].toLowerCase();

  try {
    // Build query criteria
    const criteria = {
      id: resource.id,
      runtime: ctx.runtime.entity.id,
    };

    // Find the resource with its memories
    const resourceWithMemory = await ctx.runtime.entities[resourceEntityName].findOne(criteria, {
      populate: ["memories"],
      orderBy: resourceType === "Unit" ? { index: "ASC" } : undefined,
    });

    if (!resourceWithMemory) {
      resource.memory = null;
      return resource;
    }

    // Filter memories that don't have the other entity type (e.g., for Unit, filter memories without tagId)
    const memories = resourceWithMemory.memories.filter((mem) => !mem[otherEntityName]);

    // Assign the first memory to the resource (if available)
    resource.memory = memories.length > 0 ? memories[0] : null;

    return resource;
  } catch (error) {
    console.error(`Error retrieving ${resourceType} memory:`, error);
    throw error;
  }
};

export const getTagMemory = getResourceMemory("Tag");
export const getUnitMemory = getResourceMemory("Unit");

export default {
  tag: getTagMemory,
  unit: getUnitMemory,
  tags: getTagMemory,
  units: getUnitMemory,
};
