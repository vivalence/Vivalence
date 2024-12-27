const cache = new Map();

// @lg: faulty memoization. fails on multiple runtimes.
const memoize = (fn, ttl = 60 * 60 * 1000) => {
  return async (keys) => {
    const now = Date.now();
    const uncached = keys.filter((key) => {
      const cached = cache.get(key);
      return !cached || now - cached.timestamp > ttl;
    });
    if (uncached.length) {
      const items = await fn(uncached);
      items.forEach((item) => {
        if (item) {
          cache.set(item.slug, {
            data: item,
            timestamp: now,
          });
        }
      });
    }
    return keys.map((key) => {
      const cached = cache.get(key);
      return cached ? cached.data : null;
    });
  };
};

export default async function (body, ctx) {
  const { slug } = body;
  const [tag] = await memoize(getTag(ctx))([slug]);
  return tag;
}

const getTag =
  (ctx) =>
  async ([slug]) => {
    const { data, error } = await ctx.runtime.services.supabase
      .from("Tag")
      .select("id, data, name, description, slug, traits, runtimeId")
      .eq("slug", slug)
      .eq("runtimeId", ctx.runtime.manifest.id)
      .maybeSingle();
    if (error) throw error;
    return [data];
  };
