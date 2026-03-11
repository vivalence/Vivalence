import { is, object, promise, fn } from "@vivalence/typology";

const CHUNK = 100;
const log = (phase) => (done, total) => console.log(`[DATASET:install] ${phase} ${done}/${total}`);

export const DATASET = async (mode, daemon) => {
  if (mode.entity.installed) return;

  const entities = mode.cake.dataset.entities;
  const flush = () => daemon.entities.em.flush();

  const upsertAll = (type) =>
    (entities[type] || []).map((item) => {
      const { literals, symbols, ...data } = item;
      return promise.retry(async () => upsert(daemon, type, data));
    });

  await promise.batched(upsertAll("symbol"), CHUNK, {
    afterChunk: flush,
    onChunk: fn.every(5, log("upsert:symbol")),
  });
  await promise.batched(upsertAll("literal"), CHUNK, {
    afterChunk: flush,
    onChunk: fn.every(5, log("upsert:literal")),
  });

  await linkPhase(daemon, "symbol", "literal", entities.symbol || []);
  await linkPhase(daemon, "literal", "symbol", entities.literal || []);
};

async function upsert(daemon, type, data) {
  const existing = await daemon.entities[type].findOne({ slug: data.slug });
  if (existing) return existing.assign(data);
  return daemon.entities[type].create(data);
}

async function linkPhase(daemon, fromType, toType, items) {
  const refs = items.filter((item) => item[toType + "s"]?.length);
  if (!refs.length) return;

  const fromSlugs = refs.map((r) => r.slug);
  const toSlugs = [...new Set(refs.flatMap((r) => r[toType + "s"].map((x) => x.slug)))];

  const froms = await daemon.entities[fromType].find(
    { slug: { $in: fromSlugs } },
    { populate: [toType + "s"] },
  );
  const tos = await daemon.entities[toType].find(
    { slug: { $in: toSlugs } },
    { populate: [fromType + "s"] },
  );

  const fromMap = new Map(froms.map((e) => [e.slug, e]));
  const toMap = new Map(tos.map((e) => [e.slug, e]));

  for (const item of refs) {
    const from = fromMap.get(item.slug);
    if (!from) continue;

    for (const ref of item[toType + "s"]) {
      let to = toMap.get(ref.slug);
      if (to) {
        to.assign(object.patch(to, ref));
      } else {
        to = daemon.entities[toType].create(ref);
        toMap.set(ref.slug, to);
      }
      from[toType + "s"].add(to);
    }

    from.assign({ updatedAt: new Date() });
  }

  console.log(`[DATASET:install] link:${fromType} ${refs.length} entities linked`);
  await daemon.entities.em.flush();
}

// import { is, object, promise, fn } from "@vivalence/typology";

// const CHUNK = 100;
// const log = (phase) => (done, total) => console.log(`${phase} ${done}/${total}`);

// export const DATASET = async (mode, daemon) => {
//   if (mode.entity.installed) return;

//   const entities = mode.cake.dataset.entities;

//   const upsertAll = (type) =>
//     (entities[type] || []).map((item) => {
//       const { literals, symbols, ...data } = item;
//       return promise.retry(async () => upsert(daemon, type, data));
//     });

//   await promise.batched(upsertAll("symbol"), CHUNK, { onChunk: log("upsert:symbol") });
//   await promise.batched(upsertAll("literal"), CHUNK, { onChunk: log("upsert:literal") });
//   await daemon.entities.em.flush();

//   const linkAll = (type, toType) =>
//     (entities[type] || [])
//       .filter((item) => item[toType + "s"]?.length)
//       .map((item) =>
//         promise.retry(async () => link(daemon, type, item.slug, toType, item[toType + "s"])),
//       );

//   (async () => {
//     await promise.resilient(linkAll("symbol", "literal"), {
//       onEach: fn.every(10, log("link:symbol")),
//     });
//     await daemon.entities.em.flush();
//     await promise.resilient(linkAll("literal", "symbol"), {
//       onEach: fn.every(10, log("link:literal")),
//     });
//     await daemon.entities.em.flush();
//   })();
// };

// async function upsert(daemon, type, data) {
//   const existing = await daemon.entities[type].findOne({ slug: data.slug });
//   if (existing) return existing.assign(data);
//   return daemon.entities[type].create(data);
// }

// async function link(daemon, fromType, fromSlug, toType, refs) {
//   const from = await daemon.entities[fromType].findOne(
//     { slug: fromSlug },
//     { populate: [toType + "s"] },
//   );

//   if (!from) return console.log("[link error]", { fromtype, fromslug, from, totype });

//   for (const ref of refs) {
//     const to = await daemon.entities[toType].findOne(
//       { slug: ref.slug },
//       { populate: [fromType + "s"] },
//     );

//     if (to) to.assign(object.patch(to, ref));
//     else to = daemon.entities[toType].create(ref);
//     from[toType + "s"].add(to);
//   }

//   from.assign({ updatedAt: new Date() });
// }

// import { is, object, promise } from "@vivalence/typology";

// export const DATASET = async (mode, daemon) => {
//   if (mode.entity.installed) return;

//   // works but slow.
//   for (const symbol of mode.cake.dataset.entities.symbol || []) {
//     const { literals, ...data } = symbol;
//     const entity = await upsert(daemon, "symbol", data, "literal");
//     // const issues = await daemon.assert.symbol(entity);
//     // if (!is.empty(issues)) console.log("SYMBOL ISSUES", { issues });

//     if (literals) await link(daemon, "symbol", entity.slug, "literal", literals);
//     console.log("installed:", count++);
//   }

//   for (const literal of mode.cake.dataset.entities.literal || []) {
//     const { symbols, ...data } = literal;
//     const entity = await upsert(daemon, "literal", data, "symbol");
//     // const issues = await daemon.assert.literal(entity);
//     // if (!is.empty(issues)) console.log("LITERAL ISSUES", { issues });

//     if (symbols) await link(daemon, "literal", entity.slug, "symbol", symbols);
//     console.log("installed:", count++);
//   }

//   // THROWS ERRORS due to duplicates (makes sense)
//   // const CHUNK_SIZE = 10;
//   // const symbolPromises = (mode.cake.dataset.entities.symbol || []).map((symbol) => async () => {
//   //   const { literals, ...data } = symbol;
//   //   const entity = await upsert(daemon, "symbol", data, "literal");
//   //   if (literals) await link(daemon, "symbol", entity.slug, "literal", literals);
//   //   return entity;
//   // });

//   // await promise.batched(symbolPromises, CHUNK_SIZE, true);

//   // const literalPromises = (mode.cake.dataset.entities.literal || []).map((literal) => async () => {
//   //   const { symbols, ...data } = literal;
//   //   const entity = await upsert(daemon, "literal", data, "symbol");
//   //   if (symbols) await link(daemon, "literal", entity.slug, "symbol", symbols);
//   //   return entity;
//   // });

//   // await promise.batched(literalPromises, CHUNK_SIZE, true);
// };

// // let issues = await daemon.validate.literal(entity); console.log("---".repeat(10)); console.log({ entity }); console.log({ entity, issues }); if (issues.length > 0) issues = await daemon.kernel.medic.many(issues, { daemon }); if (issues.length > 0) console.json({ UNRESOLVED_LITERAL_INSTALL: issues }); console.log({ issues });

// async function upsert(daemon, type, data, toType) {
//   const existing = await daemon.entities[type].findOne(
//     { slug: data.slug },
//     { populate: [toType + "s"] },
//   );
//   if (existing) return existing.assign(data);
//   const created = daemon.entities[type].create(data);
//   await daemon.entities.em.flush();
//   return created;
// }

// async function link(daemon, fromType, fromSlug, toType, refs) {
//   const from = await daemon.entities[fromType].findOne(
//     { slug: fromSlug },
//     { populate: [toType + "s"] },
//   );

//   if (!from) return;
//   for (const ref of refs) {
//     let to = await daemon.entities[toType].findOne(
//       { slug: ref.slug },
//       { populate: [fromType + "s"] },
//     );
//     if (to) to.assign(object.patch(to, ref));
//     else {
//       to = daemon.entities[toType].create(ref);
//       await daemon.entities.em.flush();
//     }
//     const collection = from[toType + "s"];
//     if (!collection.contains(to)) collection.add(to);
//   }

//   await daemon.entities.em.flush();
// }
