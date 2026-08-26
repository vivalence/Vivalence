import { object, promise, fn, hash, shard, Dataset } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const CHUNK = 100;
const DATASPACE = new Set(["symbol", "literal"]);
const log = (phase) => (done, total) => console.log(`[DATASET:install] ${phase} ${done}/${total}`);

const unique = (rows) => {
  const bySlug = new Map();
  for (const row of rows) bySlug.set(row.slug, row);
  return [...bySlug.values()];
};

const pull = (source, mount) => {
  if (source.rows) return source.rows;
  const at = `${mount.dirname}/${source.walk ?? source.read}`;
  return source.walk ? paladin.find.data(at) : paladin.read[source.codec](at);
};

export const stamp = async (mode) => {
  const dataset = new Dataset(mode.module.dataset ?? {});
  const mount = mode.module.mount;
  const files = [];
  for (const sources of Object.values(dataset.sources)) {
    for (const source of sources) {
      if (source.rows) {
        files.push(["rows", JSON.stringify(source.rows)]);
        continue;
      }
      const at = `${mount.dirname}/${source.walk ?? source.read}`;
      if (source.walk) {
        for (const file of await paladin.find.walk(/./)(at))
          files.push([file.absolute, await Deno.readTextFile(file.absolute).catch(() => "")]);
      } else {
        files.push([at, await Deno.readTextFile(at).catch(() => "")]);
      }
    }
  }
  return files
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .reduce((folded, [path, text]) => hash.string(folded + path + text), "dataset");
};

export const DATASET = async (mode, daemon) => {
  if (mode.entity.installed) return;

  const dataset = new Dataset(mode.module.dataset ?? {});
  const meta = shard.datamap.strip(daemon.datamap.introspect());
  const mount = mode.module.mount;
  const flush = () => daemon.entities.em.flush();
  const staged = {};

  for (const type of dataset.types) {
    guard(mode, meta, type);
    if (!daemon.entities[type]) {
      console.warn(`[DATASET] ${mode.type}/${mode.slug} declares unknown entity "${type}"`);
      continue;
    }
    const relations = Object.keys(meta[type]?.properties ?? {});
    const loaded = [];
    for (const source of dataset.sources[type]) loaded.push(await pull(source, mount));
    const read = loaded.flat();
    staged[type] = unique(read);
    if (staged[type].length !== read.length)
      console.log(`[DATASET:install] ${type} ${read.length - staged[type].length} duplicate slugs folded — a row split across facets is authored once per facet`);
    const upserts = staged[type].map((row) =>
      promise.retry(() => upsert(daemon, type, object.omit(row, relations))),
    );
    await promise.batched(upserts, CHUNK, {
      afterChunk: flush,
      onChunk: fn.every(5, log(`upsert:${type}`)),
    });
  }

  for (const type of dataset.types)
    for (const [prop, relation] of Object.entries(meta[type]?.properties ?? {}))
      await linkPhase(daemon, meta, type, prop, relation, staged[type] ?? []);
};

function guard(mode, meta, type) {
  const scoped = Object.values(meta[type]?.properties ?? {}).some((relation) => relation.target === "user");
  if (!DATASPACE.has(type) || scoped)
    throw new Error(`[DATASET] ${mode.type}/${mode.slug} declares non-dataspace entity "${type}"`);
}

async function upsert(daemon, type, data) {
  const existing = await daemon.entities[type].findOne({ slug: data.slug });
  if (existing) return existing.assign(object.patch(existing, data));
  return daemon.entities[type].create(data);
}

async function linkPhase(daemon, meta, fromType, prop, relation, rows) {
  const toType = relation.target;
  if (!toType || !daemon.entities[toType]) return;

  const refs = rows.filter((row) => row[prop]?.length);
  if (!refs.length) return;

  const fromSlugs = refs.map((row) => row.slug);
  const toSlugs = [...new Set(refs.flatMap((row) => row[prop].map((ref) => ref.slug)))];
  const inverse = Object.entries(meta[toType]?.properties ?? {})
    .find(([, back]) => back.target === fromType)?.[0];

  const froms = await daemon.entities[fromType].find(
    { slug: { $in: fromSlugs } },
    { populate: [prop] },
  );
  const tos = await daemon.entities[toType].find(
    { slug: { $in: toSlugs } },
    inverse ? { populate: [inverse] } : {},
  );

  const fromMap = new Map(froms.map((entity) => [entity.slug, entity]));
  const toMap = new Map(tos.map((entity) => [entity.slug, entity]));

  for (const row of refs) {
    const from = fromMap.get(row.slug);
    if (!from) continue;

    for (const ref of row[prop]) {
      let to = toMap.get(ref.slug);
      if (to) {
        to.assign(object.patch(to, ref));
      } else {
        to = daemon.entities[toType].create(ref);
        toMap.set(ref.slug, to);
      }
      from[prop].add(to);
    }

    from.assign({ updatedAt: new Date() });
  }

  console.log(`[DATASET:install] link:${fromType}.${prop} ${refs.length} entities linked`);
  await daemon.entities.em.flush();
}

// import { is, object, promise, fn } from "@vivalence/typology";

// const CHUNK = 100;
// const log = (phase) => (done, total) => console.log(`${phase} ${done}/${total}`);

// export const DATASET = async (mode, daemon) => {
//   if (mode.entity.installed) return;

//   const entities = mode.module.dataset.entities;

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
//   for (const symbol of mode.module.dataset.entities.symbol || []) {
//     const { literals, ...data } = symbol;
//     const entity = await upsert(daemon, "symbol", data, "literal");
//     // const issues = await daemon.assert.symbol(entity);
//     // if (!is.empty(issues)) console.log("SYMBOL ISSUES", { issues });

//     if (literals) await link(daemon, "symbol", entity.slug, "literal", literals);
//     console.log("installed:", count++);
//   }

//   for (const literal of mode.module.dataset.entities.literal || []) {
//     const { symbols, ...data } = literal;
//     const entity = await upsert(daemon, "literal", data, "symbol");
//     // const issues = await daemon.assert.literal(entity);
//     // if (!is.empty(issues)) console.log("LITERAL ISSUES", { issues });

//     if (symbols) await link(daemon, "literal", entity.slug, "symbol", symbols);
//     console.log("installed:", count++);
//   }

//   // THROWS ERRORS due to duplicates (makes sense)
//   // const CHUNK_SIZE = 10;
//   // const symbolPromises = (mode.module.dataset.entities.symbol || []).map((symbol) => async () => {
//   //   const { literals, ...data } = symbol;
//   //   const entity = await upsert(daemon, "symbol", data, "literal");
//   //   if (literals) await link(daemon, "symbol", entity.slug, "literal", literals);
//   //   return entity;
//   // });

//   // await promise.batched(symbolPromises, CHUNK_SIZE, true);

//   // const literalPromises = (mode.module.dataset.entities.literal || []).map((literal) => async () => {
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
