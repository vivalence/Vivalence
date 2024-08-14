import { getTagMemory, getWeakest } from "../memory/lib/memory.js";

export default async function (body, ctx) {
  let { tags, tagIds, take } = body;

  if (!tags && tagIds) {
    tags = await ctx.runtime.call("/tags/fromTagIds", { tagIds });
  }

  tags = await Promise.all(tags.map((tag) => getTagMemory(tag, ctx)));
  tags = getWeakest(tags, take);

  return tags;
}
