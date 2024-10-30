import { drivers } from "./drivers/index.js";

const sortByMemory = (a, b) => {
  if (!a.memory && !b.memory) return 0;
  if (!a.memory) return 1;
  if (!b.memory) return -1;
  return b.memory.strength - a.memory.strength;
};

const sortResources = (resources) => {
  return resources.sort(sortByMemory);
};

async function sort(resources) {
  for (const resource of resources) {
    if (resource.memory) {
      const driver = drivers[resource.memory.type];
      if (!driver) throw new Error(`No driver found for memory type ${resource.memory.type}`);
      resource.memory.strength = await driver.strength(resource.memory);
    }
  }
  return sortResources(resources);
}

export default sort;
