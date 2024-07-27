import { getTagMemory } from "../lib/memory.js";

export default async function (body, runtime) {
  let { tags, accept } = body;

  tags = await Promise.all(tags.map(getTagMemory(runtime.locals)));

  tags = tags.filter((tag) => {
    if (!tag.memory && accept.includes("UNKNOWN")) return true;
    if (accept.includes(tag.memory.status)) return true;
    return false;
  });

  return tags;
}
