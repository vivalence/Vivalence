export const getResourceMemory = (entityType) => async (entity, ctx) => {
  const otherEntity = { unit: "tag", tag: "unit" }[entityType];

  try {
    // Build query criteria
    const criteria = {
      id: entity.id,
    };

    // Find the resource with its memories
    const resourceWithMemory = await ctx.runtime.entities[entityType].findOne(
      criteria,
      { populate: ["memories"] },
    );

    if (!resourceWithMemory) {
      entity.memory = null;
      return entity;
    }

    // Filter memories that don't have the other entity type (e.g., for Unit, filter memories without tagId)
    const memories = resourceWithMemory.memories.filter(
      (mem) => !mem[otherEntity],
    );

    // Assign the first memory to the resource (if available)
    entity.memory = memories.length > 0 ? memories[0] : null;

    return entity;
  } catch (error) {
    console.error(`Error retrieving ${entityType} memory:`, error);
    throw error;
  }
};

export const getTagMemory = getResourceMemory("tag");
export const getUnitMemory = getResourceMemory("unit");

export default {
  tag: getTagMemory,
  unit: getUnitMemory,
  tags: getTagMemory,
  units: getUnitMemory,
};
