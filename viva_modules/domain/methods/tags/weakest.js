import { getTagMemory, getWeakest } from "../memory/lib/memory.js";

export default async function (body, ctx) {
  let { tags, tagIds, blacklist, take } = body;

  if (!tags && tagIds) {
    tags = await ctx.runtime.call("/tags/fromTagIds", { blacklist, tagIds });
  }

  if (blacklist) tags = tags.filter((tag) => !blacklist.tags.includes(tag.id));

  tags = await Promise.all(tags.map((tag) => getTagMemory(tag, ctx)));
  tags = getWeakest(tags, take);

  return tags;
}
