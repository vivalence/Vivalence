import {
  array,
  crypto,
  Dataset,
  fn,
  object,
  promise,
  shard,
} from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const CHUNK = 100;

const installer = Deno.readTextFile(new URL(import.meta.url));

export const stamp = async (mode) => {
  const dataset = new Dataset(mode.module.dataset ?? {});
  const mount = mode.module.source;
  const files = [["installer", await installer]];
  if (mode.module.fileset) files.push(...(await paladin.stamp.tree(`${mount.dirname}/${mode.module.fileset.path}`)));
  for (const sources of Object.values(dataset.sources)) {
    for (const source of sources) {
      if (source.load) {
        files.push(["load", source.stamp ? String(await source.stamp(mode)) : ""]);
        continue;
      }
      if (source.rows) {
        files.push(["rows", JSON.stringify(source.rows)]);
        continue;
      }
      const at = `${mount.dirname}/${source.walk ?? source.read}`;
      if (source.walk) files.push(...(await paladin.stamp.tree(at)));
      else files.push([source.read, await crypto.digestBytes(await Deno.readFile(at).catch(() => new Uint8Array()))]);
    }
  }
  return paladin.stamp.fold(files);
};
const DATASPACE = new Set(["symbol", "literal"]);
const progress = (phase) => fn.every(5, (done, total) => phase.log({ done, total }));

const unique = (rows) => {
  const bySlug = new Map();
  for (const row of rows) bySlug.set(row.slug, row);
  return [...bySlug.values()];
};

const pull = (source, mode) => {
  if (source.load) return source.load(mode);
  if (source.rows) return source.rows;
  const at = `${mode.module.source.dirname}/${source.walk ?? source.read}`;
  return source.walk ? paladin.find.data(at) : paladin.read[source.codec](at);
};


export const DATASET = async (mode, context) => {
  if (mode.entity.installed) return;

  const installing = mode.stdout.branch("install").start();
  try {
    await install(mode, context, installing);
  } catch (error) {
    installing.fault(error);
    throw error;
  } finally {
    installing.stop();
  }
};

async function install(mode, context, installing) {
  const dataset = new Dataset(mode.module.dataset ?? {});
  const meta = shard.datamap.strip(context.datamap.getMetadata());
  const repo = (type) => context.entities[type];
  const em = context.entities.em;
  const flush = async () => {
    await em.flush();
    em.clear();
  };
  const staged = {};

  for (const type of dataset.types) {
    guard(mode, meta, type);
    if (!context.entities[type]) {
      installing.log({ skipped: type, reason: "unknown entity" });
      continue;
    }
    const relations = Object.keys(meta[type]?.properties ?? {});
    // a declared source is SCHEME — it describes the module and is shared by every mounting of it.
    // a computed source is the mounting's own reading of its world, and belongs to that mode alone.
    const loaded = [];
    for (const source of dataset.sources[type]) loaded.push(await pull(source, mode));
    const read = loaded.flat();
    staged[type] = unique(read);
    const phase = installing.branch(type).start();
    if (staged[type].length !== read.length) phase.log({ folded: read.length - staged[type].length });
    const store = repo(type);
    const emit = progress(phase);
    let done = 0;
    for (const rows of array.chunk(staged[type], CHUNK)) {
      await promise.retry(async () => {
        const owner = await repo("mode").findOneOrFail({ id: mode.id });
        const existing = await store.find({
          slug: { $in: rows.map((row) => row.slug) },
        });
        const byKey = new Map(existing.map((entity) => [entity.slug, entity]));
        for (const row of rows) {
          const data = object.omit(row, relations);
          const found = byKey.get(row.slug);
          if (found) found.assign(object.patch(found, data));
          else store.create({ ...data, mode: owner });
        }
        await flush();
      })();
      emit(done += rows.length, staged[type].length);
    }
    phase.stop();
  }

  for (const type of dataset.types) {
    for (const [prop, relation] of Object.entries(meta[type]?.properties ?? {})) {
      await linkPhase({ repo, context, flush, mode, installing }, meta, type, prop, relation, staged[type] ?? []);
    }
  }
}

function guard(mode, meta, type) {
  const scoped = Object.values(meta[type]?.properties ?? {}).some((relation) =>
    relation.target === "user"
  );
  if (!DATASPACE.has(type) || scoped) {
    throw new Error(
      `[DATASET] ${mode.manifest.type}/${mode.manifest.slug} declares non-dataspace entity "${type}"`,
    );
  }
}

async function linkPhase(
  { repo, context, flush, mode, installing },
  meta,
  fromType,
  prop,
  relation,
  rows,
) {
  const toType = relation.target;
  if (!toType || !context.entities[toType]) return;

  const refs = rows.filter((row) => row[prop]?.length);
  if (!refs.length) return;

  const pmeta = context.datamap.getMetadata().get(repo(fromType).getEntityName())
    .properties[prop];
  if (pmeta?.kind !== "m:n") {
    installing.log({ skipped: `${fromType}.${prop}`, reason: "not m:n" });
    return;
  }

  const phase = installing.branch(`${fromType}.${prop}`).start();
  const emit = progress(phase);
  let done = 0;
  for (const chunk of array.chunk(refs, CHUNK)) {
    await promise.retry(async () => {
      const toSlugs = [
        ...new Set(chunk.flatMap((row) => row[prop].map((ref) => ref.slug))),
      ];
      const holder = await repo("mode").findOneOrFail({ id: mode.id });
      const found = (held, type, slug) => held.find((entity) => entity.slug === slug);
      const froms = await repo(fromType).find({
        slug: { $in: chunk.map((row) => row.slug) },
      }, { populate: [prop] });
      const tos = await repo(toType).find({ slug: { $in: toSlugs } });
      const fromMap = new Map(
        chunk.map((row) => [row.slug, found(froms, fromType, row.slug)]).filter(
          ([, entity]) => entity,
        ),
      );
      const toMap = new Map(
        toSlugs.map((slug) => [slug, found(tos, toType, slug)]).filter((
          [, entity],
        ) => entity),
      );
      for (const row of chunk) {
        const from = fromMap.get(row.slug);
        if (!from) continue;
        for (const ref of row[prop]) {
          let to = toMap.get(ref.slug);
          if (to) to.assign(object.patch(to, ref));
          else {toMap.set(
              ref.slug,
              to = repo(toType).create({ ...ref, mode: holder }),
            );}
          from[prop].add(to);
        }
        from.assign({ updatedAt: new Date() });
      }
      await flush();
    })();
    emit(done += chunk.length, refs.length);
  }
  phase.stop();
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
