// export default async function hydrateScope({ scope }, ctx) {const fetchUnits = (ids) => ctx.runtime.services.supabase .from("Unit") .select("id, slug, data, annotation") .eq("runtimeId", ctx.runtime.manifest.id) .in("id", ids) .then(({ data }) => data); const fetchTags = (ids) => ctx.runtime.services.supabase .from("Tag") .select("id, slug, data, traits, name") .eq("runtimeId", ctx.runtime.manifest.id) .in("id", ids) .then(({ data }) => data); const hydrateUnit = async (value) => {if (!value?.id) return value; const [unitData] = await fetchUnits([value.id]); return { ...value, ...unitData };}; const hydrateTag = async (value) => {if (!value?.id) return value; const [tagData] = await fetchTags([value.id]); return { ...value, ...tagData };}; const hydrate = async (value, key) => {if (!value) return value; const isTagRelated = key === "tag" || key === "tags"; const hydrateFn = isTagRelated ? hydrateTag : hydrateUnit; return Array.isArray(value) ? Promise.all(value.map(hydrateFn)) : hydrateFn(value);}; return Object.fromEntries(await Promise.all(Object.entries(scope).map(async ([key, value]) => [key, await hydrate(value, key)]),),);}

// claude insisted...
const cache = new Map();
const memoize = (fn, ttl = 60 * 60 * 1000) => {
  return async (ids) => {
    const now = Date.now();
    const uncached = ids.filter((id) => {
      const cached = cache.get(id);
      return !cached || now - cached.timestamp > ttl;
    });
    if (uncached.length) {
      const items = await fn(uncached);
      items.forEach((item) => {
        if (item) {
          cache.set(item.id, {
            data: item,
            timestamp: now,
          });
        }
      });
    }
    return ids.map((id) => {
      const cached = cache.get(id);
      return cached ? cached.data : null;
    });
  };
};

export default async function hydrateScope({ scope }, ctx) {
  const fetchUnits = memoize((ids) =>
    ctx.runtime.services.supabase
      .from("Unit")
      .select("id, slug, data, annotation")
      .eq("runtimeId", ctx.runtime.manifest.id)
      .in("id", ids)
      .then(({ data }) => data),
  );

  const fetchTags = memoize((ids) =>
    ctx.runtime.services.supabase
      .from("Tag")
      .select("id, slug, data, traits, name")
      .eq("runtimeId", ctx.runtime.manifest.id)
      .in("id", ids)
      .then(({ data }) => data),
  );

  const hydrateTag = async (value) => {
    if (!value?.id) return value;
    const [tagData] = await fetchTags([value.id]);
    return { ...value, ...tagData };
  };

  const hydrateUnit = async (value) => {
    if (!value?.id) return value;
    const [unitData] = await fetchUnits([value.id]);
    if (!unitData) return value;

    // Hydrate nested tags if they exist
    const hydratedTags = value.tags ? await Promise.all(value.tags.map(hydrateTag)) : value.tags;

    return {
      ...value,
      ...unitData,
      tags: hydratedTags,
    };
  };

  const hydrate = async (value, key) => {
    if (!value) return value;
    const isTagRelated = key === "tag" || key === "tags";
    const hydrateFn = isTagRelated ? hydrateTag : hydrateUnit;
    return Array.isArray(value) ? Promise.all(value.map(hydrateFn)) : hydrateFn(value);
  };

  return Object.fromEntries(
    await Promise.all(
      Object.entries(scope).map(async ([key, value]) => [key, await hydrate(value, key)]),
    ),
  );
}
// export default async function ({ scope }, ctx) {
//   const hydrateToken = async (token) => {
//     const tokenIds = token.tags.map(({ id }) => id);

//     const [{ data: unit, error: unitError }, { data: tags, error: tagsError }] = await Promise.all([
//       ctx.runtime.services.supabase
//         .from("Unit")
//         .select("id, slug, data, annotation")
//         .eq("id", token.id)
//         .eq("runtimeId", ctx.runtime.manifest.id)
//         .single(),
//       ctx.runtime.services.supabase
//         .from("Tag")
//         .select("id, slug, data, traits, name")
//         .eq("runtimeId", ctx.runtime.manifest.id)
//         .in("id", tokenIds),
//     ]);
//     if (unitError || tagsError) throw unitError || tagsError;
//     return { ...token, ...unit, tags };
//   };

//     const unit = scope.unit && await hydrateToken(scope.unit);
//     const tag = scope.tag && await hydrateToken(scope.tag);
//   const units = await Promise.all(scope.units.map(hydrateToken));
//   const tags = await Promise.all(scope.tags.map(hydrateToken));

//     return { tag, unit, units, tags, };
// }
