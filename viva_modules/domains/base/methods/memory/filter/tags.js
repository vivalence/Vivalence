import { getTagMemory, filterResourceByMemory } from "../lib/memory.js";

export default async function (body, ctx) {
  let { tags, accept, blacklist } = body;

  if (blacklist && blacklist.tags && blacklist.tags.length > 0) {
    tags = tags.filter((t) => !blacklist.tags.includes(t.id));
  }

  tags = await Promise.all(tags.map((t) => getTagMemory(t, ctx)));

  tags = tags.filter(filterResourceByMemory(accept));

  return tags;
}
