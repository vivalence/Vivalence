import { is } from "@vivalence/typology";

export const DATASET = async (mode, daemon) => {
  if (mode.entity.installed) return;

  for (const symbol of mode.cake.dataset.entities.symbol || []) {
    const { literals, ...data } = symbol;
    const entity = await upsert(daemon, "symbol", data);
    const issues = await daemon.assert.symbol(entity);
    if (!is.empty(issues)) console.log("SYMBOL ISSUES", { issues });

    if (literals) await link(daemon, "symbol", entity.slug, "literal", literals);
  }

  for (const literal of mode.cake.dataset.entities.literal || []) {
    const { symbols, ...data } = literal;
    const entity = await upsert(daemon, "literal", data);
    const issues = await daemon.assert.literal(entity);
    // maybe delete the literal again if issues persist?

    if (!is.empty(issues)) console.log("LITERAL ISSUES", { issues });

    if (symbols) await link(daemon, "literal", entity.slug, "symbol", symbols);
  }
};
// let issues = await daemon.validate.literal(entity); console.log("---".repeat(10)); console.log({ entity }); console.log({ entity, issues }); if (issues.length > 0) issues = await daemon.kernel.medic.many(issues, { daemon }); if (issues.length > 0) console.json({ UNRESOLVED_LITERAL_INSTALL: issues }); console.log({ issues });

async function upsert(daemon, type, data) {
  const existing = await daemon.entities[type].findOne({ slug: data.slug });
  if (existing) return existing.assign(data);
  const created = daemon.entities[type].create(data);
  await daemon.entities.em.flush();
  return created;
}

async function link(daemon, fromType, fromSlug, toType, refs) {
  const from = await daemon.entities[fromType].findOne(
    { slug: fromSlug },
    { populate: [toType + "s"] },
  );
  if (!from) return;

  for (const ref of refs) {
    let to = await daemon.entities[toType].findOne({ slug: ref.slug });
    if (!to) {
      to = daemon.entities[toType].create({ slug: ref.slug, traits: [], data: {} });
      await daemon.entities.em.flush();
    }
    const collection = from[toType + "s"];
    if (!collection.contains(to)) collection.add(to);
  }

  await daemon.entities.em.flush();
}

// export const DATASET = async (mode, daemon) => {
//   if (mode.entity.installed) return;

//   if (mode.cake.dataset.entities.symbol) {
//     for (const symbol of mode.cake.dataset.entities.symbol) {
//       let installed;
//       const existing = await daemon.entities.symbol.findOne({ slug: symbol.slug });
//       // console.log({ existing });
//       if (existing) {
//         installed = existing.assign(symbol);
//       } else {
//         installed = daemon.entities.symbol.create(symbol);
//         await daemon.entities.em.flush();
//       }

//       // console.log({ installed });
//       const issues = await daemon.assert.symbol(symbol);
//       // console.log({ symbol, issues });
//     }
//   }

//   if (mode.cake.dataset.entities.literal) {
//     for (const literal of mode.cake.dataset.entities.literal) {
//       console.log("---".repeat(10));
//       console.log("---".repeat(10));
//       console.log({ literal });
//       let installed;
//       const existing = await daemon.entities.literal.findOne({ slug: literal.slug });

//       console.log({ existing });
//       if (existing) {
//         installed = existing.assign(literal);
//       } else {
//         installed = daemon.entities.literal.create(literal);
//         await daemon.entities.em.flush();
//       }

//       console.log({ installed });
//       const issues = await daemon.assert.literal(literal);

//       console.log({ issues });
//       // let issues = await daemon.validate.literal(literal, ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL",]);
//       //   // console.log("---".repeat(10));
//       //   // console.log({ literal, issues });
//       //   if (issues.length > 0) issues = await daemon.kernel.medic.many(issues, { daemon });
//       //   if (issues.length > 0) console.json({ UNRESOLVED_LITERAL_INSTALL: issues });
//       //   console.log({ literal, issues });
//     }
//   }
//   // await daemon.entities.em.flush();
// };
