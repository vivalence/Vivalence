import { drivers } from "../../../memory/index.js";

const sortByMemory = (a, b) => {
  if (!a.memory && !b.memory) return 0;
  if (!a.memory) return -1;
  if (!b.memory) return 1;
  return a.memory.strength - b.memory.strength;
};

const sortResources = (resources) => {
  return resources.sort(sortByMemory);
};

async function sort(resources) {
  for (const resource of resources) {
    if (!resource.memory) continue;
    const driver = drivers[resource.memory.type];
    if (!driver) {
      console.log(`No driver found for memory type ${resource.memory.type}`, resource);
      continue;
    }
    resource.memory.strength = await driver.strength({ memory: resource.memory });
  }
  const sorted = sortResources(resources);
  return sorted;
}

export default sort;
