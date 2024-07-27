import { getTagMemory, getWeakest } from "../memory/lib/memory.js";

export default async function (body, runtime) {
  let { tags, tagIds, take } = body;

  if (!tags && tagIds) {
    tags = await runtime.locals.client("tags/fromTagIds", { tagIds }).ok();
  }

  tags = await Promise.all(tags.map(getTagMemory(runtime.locals)));
  tags = getWeakest(tags, take);

  return tags;
}
