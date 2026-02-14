import { raw } from "@mikro-orm/core";
import { ProductionResult } from "@vivalence/typology";

export default async function provision(inputs, ctx) {
  const { seek, blacklist, scope } = inputs;

  if (!seek.symbols?.tense || !seek.symbols.mood)
    throw new Error("conjugation requires tense and mood");

  const [tense, mood] = await Promise.all([
    ctx.daemon.entities.symbol.findOne(seek.symbols.tense),
    ctx.daemon.entities.symbol.findOne(seek.symbols.mood),
  ]);

  const conjugationLiterals = seek.symbols?.verb
    ? await findByVerb(ctx, { blacklist, tense, mood, verb: seek.symbols.verb })
    : seek.symbols?.verbs
      ? await findByWeakestVerb(ctx, {
          blacklist,
          tense,
          mood,
          verbs: seek.symbols.verbs,
        })
      : (() => {
          throw new Error("conjugation provisioning needs a verb");
        })();

  if (!conjugationLiterals.length)
    return ProductionResult.cast.exhausted({
      seek,
      reason: "no candidate literals",
    });

  const infinitiveLiteral = await ctx.daemon.entities.literal.findOne({
    [raw('json_extract(annotation, "$.verbform")')]: "inf",
    [raw('json_extract(annotation, "$.lemma")')]:
      conjugationLiterals[0].annotation.lemma,
  });

  if (!infinitiveLiteral || conjugationLiterals.length !== 6)
    return ProductionResult.cast.exhausted({
      reason: "incomplete conjugation set",
      have: conjugationLiterals.length,
      hasInfinitive: !!infinitiveLiteral,
    });

  const conjugations = conjugationLiterals
    .sort(sortByPerformer)
    .map((literal, index) => ({
      known: `${literal.data.known}`,
      learning: `${literal.data.learning}`,
      meta: { index },
      scope: { literal: literal.id },
    }));

  scope.literals = conjugations.map(({ scope }) => scope.literal);

  return ProductionResult.cast.nominal({
    data: {
      tense: tense.name,
      mood: mood.name,
      infinitive: infinitiveLiteral.data,
      conjugations,
      scope,
    },
    scope,
  });
}

const findByVerb = (ctx, { blacklist, tense, mood, verb }) =>
  ctx.daemon.entities.literal.find(
    {
      id: { $nin: blacklist.literals },
      $and: [{ symbols: verb }, { symbols: mood.id }, { symbols: tense.id }],
    },
    { populate: ["symbols"], limit: 6 },
  );

const findByWeakestVerb = async (ctx, { blacklist, tense, mood, verbs }) => {
  const candidateLiterals = await ctx.daemon.entities.literal.find(
    {
      id: { $nin: blacklist.literals },
      $and: [
        { symbols: tense.id },
        { symbols: mood.id },
        { symbols: { $in: verbs } },
      ],
    },
    { fields: ["id"] },
  );

  const [weakestLiteral] = await ctx.daemon.call("/pick/literal/byStrength", {
    take: 1,
    seek: { literals: candidateLiterals },
    blacklist,
  });

  return ctx.daemon.entities.literal.find(
    {
      id: { $nin: blacklist.literals },
      [raw('json_extract(annotation, "$.lemma")')]:
        weakestLiteral.annotation.lemma,
      $and: [{ symbols: tense.id }, { symbols: mood.id }],
    },
    { populate: ["symbols"], limit: 6 },
  );
};

const sortByPerformer = (a, b) => {
  const sumSortValues = (literal) =>
    literal.symbols
      .filter((symbol) => symbol.traits.includes("ONTOLOGICAL"))
      .reduce((sum, symbol) => {
        const { leaf, branch } = symbol.data.ONTOLOGICAL;
        if (branch === "person") return sum + parseInt(leaf);
        if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
        return sum;
      }, 0);
  return sumSortValues(a) - sumSortValues(b);
};
// import { raw } from "@mikro-orm/core";

// export default async function provision(inputs, ctx) {
//   const { seek, blacklist, scope } = inputs;

//   if (!seek.symbols?.tense || !seek.symbols.mood)
//     throw new Error("conjugation requires tense and mood");

//   const [tense, mood] = await Promise.all([
//     ctx.daemon.entities.symbol.findOne(seek.symbols.tense),
//     ctx.daemon.entities.symbol.findOne(seek.symbols.mood),
//   ]);

//   const conjugationLiterals = seek.symbols?.verb
//     ? await findByVerb(ctx, { blacklist, tense, mood, verb: seek.symbols.verb })
//     : seek.symbols?.verbs
//       ? await findByWeakestVerb(ctx, {
//           blacklist,
//           tense,
//           mood,
//           verbs: seek.symbols.verbs,
//         })
//       : (() => {
//           throw new Error("conjugation provisioning needs a verb");
//         })();

//   const infinitiveLiteral = await ctx.daemon.entities.literal.findOne({
//     [raw('json_extract(annotation, "$.verbform")')]: "inf",
//     [raw('json_extract(annotation, "$.lemma")')]:
//       conjugationLiterals[0].annotation.lemma,
//   });

//   if (!infinitiveLiteral || conjugationLiterals.length !== 6)
//     throw new Error("not the right number of conjugation literals found", {
//       cause: { infinitiveLiteral, conjugationLiterals, inputs },
//     });

//   const conjugations = conjugationLiterals
//     .sort(sortByPerformer)
//     .map((literal, index) => ({
//       known: `${literal.data.known}`,
//       learning: `${literal.data.learning}`,
//       meta: { index },
//       scope: { literal: { id: literal.id } },
//     }));

//   scope.literals = conjugations.map(({ scope }) => scope.literal);

//   return {
//     data: {
//       tense: seek.symbols.tense.name,
//       mood: seek.symbols.mood.name,
//       infinitive: infinitiveLiteral.data,
//       conjugations,
//     },
//     scope,
//   };
// }

// const findByVerb = (ctx, { blacklist, tense, mood, verb }) =>
//   ctx.daemon.entities.literal.find(
//     {
//       id: { $nin: blacklist.literals },
//       $and: [{ symbols: verb }, { symbols: mood.id }, { symbols: tense.id }],
//     },
//     { populate: ["symbols"], limit: 6 },
//   );

// const findByWeakestVerb = async (ctx, { blacklist, tense, mood, verbs }) => {
//   const candidateLiterals = await ctx.daemon.entities.literal.find(
//     {
//       id: { $nin: blacklist.literals },
//       $and: [
//         { symbols: tense.id },
//         { symbols: mood.id },
//         { symbols: { $in: verbs } },
//       ],
//     },
//     { fields: ["id"] },
//   );

//   const [weakestLiteral] = await ctx.daemon.call("/pick/literal/byStrength", {
//     take: 1,
//     seek: { literals: candidateLiterals },
//     blacklist,
//   });

//   return ctx.daemon.entities.literal.find(
//     {
//       id: { $nin: blacklist.literals },
//       [raw('json_extract(annotation, "$.lemma")')]:
//         weakestLiteral.annotation.lemma,
//       $and: [{ symbols: tense.id }, { symbols: mood.id }],
//     },
//     { populate: ["symbols"], limit: 6 },
//   );
// };

// const sortByPerformer = (a, b) => {
//   const sumSortValues = (literal) =>
//     literal.symbols
//       .filter((symbol) => symbol.traits.includes("ONTOLOGICAL"))
//       .reduce((sum, symbol) => {
//         const { leaf, branch } = symbol.data.ONTOLOGICAL;
//         if (branch === "person") return sum + parseInt(leaf);
//         if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
//         return sum;
//       }, 0);
//   return sumSortValues(a) - sumSortValues(b);
// };
// // import { raw } from "@mikro-orm/core";

// // export default async function provision(inputs, ctx) {
// //   const { seek, blacklist, scope } = inputs;
// //   let conjugationLiterals;

// //   if (!seek.symbols?.tense || !seek.symbols.mood)
// //     throw new Error("conjugation requires tense and mood");

// //   const [tense, mood] = await Promise.all([
// //     ctx.daemon.entities.symbol.findOne(seek.symbols.tense),
// //     ctx.daemon.entities.symbol.findOne(seek.symbols.mood),
// //   ]);

// //   if (!seek.symbols.verb && seek.symbols?.verbs) {
// //     const candidateLiterals = await ctx.daemon.entities.literal.find(
// //       {
// //         id: { $nin: blacklist.literals },
// //         $and: [
// //           { symbols: tense.id },
// //           { symbols: mood.id },
// //           { symbols: { $in: seek.symbols.verbs } },
// //         ],
// //       },
// //       { fields: ["id"] },
// //     );

// //     const [weakestLiteral] = await ctx.daemon.call("/pick/literal/byStrength", {
// //       take: 1,
// //       seek: { literals: candidateLiterals },
// //       blacklist,
// //     });

// //     conjugationLiterals = await ctx.daemon.entities.literal.find(
// //       {
// //         id: { $nin: blacklist.literals },
// //         [raw('json_extract(annotation, "$.lemma")')]:
// //           weakestLiteral.annotation.lemma,
// //         $and: [{ symbols: tense.id }, { symbols: mood.id }],
// //       },
// //       { populate: ["symbols"], limit: 6 },
// //     );
// //   } else if (seek.symbols?.verb) {
// //     conjugationLiterals = await ctx.daemon.entities.literal.find(
// //       {
// //         id: { $nin: blacklist.literals },
// //         $and: [
// //           { symbols: seek.symbols.verb },
// //           { symbols: mood.id },
// //           { symbols: tense.id },
// //         ],
// //       },
// //       { populate: ["symbols"], limit: 6 },
// //     );
// //   } else throw new Error("conjugation provisioning needs a verb");

// //   const infinitiveLiteral = await ctx.daemon.entities.literal.findOne({
// //     [raw('json_extract(annotation, "$.verbform")')]: "inf",
// //     [raw('json_extract(annotation, "$.lemma")')]:
// //       conjugationLiterals[0].annotation.lemma,
// //   });

// //   if (!infinitiveLiteral || conjugationLiterals.length !== 6) {
// //     throw new Error("not the right number of conjugation literals found", {
// //       cause: { infinitiveLiteral, conjugationLiterals, inputs },
// //     });
// //   }

// //   const conjugations = conjugationLiterals
// //     .sort(sortByPerformer)
// //     .map((literal, index) => ({
// //       known: `${literal.data.known}`,
// //       learning: `${literal.data.learning}`,
// //       meta: { index },
// //       scope: {
// //         literal: {
// //           id: literal.id,
// //         },
// //       },
// //     }));

// //   scope.literals = conjugations.map(({ scope }) => scope.literal);

// //   const product = {
// //     data: {
// //       tense: seek.symbols.tense.name,
// //       mood: seek.symbols.mood.name,
// //       infinitive: infinitiveLiteral.data,
// //       conjugations,
// //     },
// //     scope,
// //   };

// //   return product;
// // }

// // const sortByPerformer = (a, b) => {
// //   const sumSortValues = (literal) =>
// //     literal.symbols
// //       .filter((symbol) => symbol.traits.includes("ONTOLOGICAL"))
// //       .reduce((sum, symbol) => {
// //         const { leaf, branch } = symbol.data.ONTOLOGICAL;
// //         if (branch === "person") return sum + parseInt(leaf);
// //         if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
// //         return sum;
// //       }, 0);

// //   return sumSortValues(a) - sumSortValues(b);
// // };
// // export default async function provision(inputs, ctx) {
// //   const { seek, blacklist, scope } = inputs

// //   if (!seek.symbols?.tense || !seek.symbols.mood)
// //     return ProductionResult.error(new Error("conjugation requires tense and mood"))

// //   const [tense, mood] = await Promise.all([
// //     ctx.daemon.entities.symbol.findOne(seek.symbols.tense),
// //     ctx.daemon.entities.symbol.findOne(seek.symbols.mood),
// //   ])

// //   const conjugationLiterals = await findConjugationLiterals(seek, blacklist, tense, mood, ctx)

// //   if (!conjugationLiterals || conjugationLiterals.length === 0)
// //     return ProductionResult.exhausted({ seek, reason: "no candidate literals" })

// //   const infinitiveLiteral = await ctx.daemon.entities.literal.findOne({
// //     [raw('json_extract(annotation, "$.verbform")')]: "inf",
// //     [raw('json_extract(annotation, "$.lemma")')]: conjugationLiterals[0].annotation.lemma,
// //   })

// //   if (!infinitiveLiteral || conjugationLiterals.length !== 6)
// //     return ProductionResult.degraded(
// //       conjugationLiterals.length > 0 ? [buildProduct(conjugationLiterals, infinitiveLiteral, scope, seek)] : [],
// //       { have: conjugationLiterals.length, need: 6, infinitiveLiteral: !!infinitiveLiteral }
// //     )

// //   return ProductionResult.fulfilled([buildProduct(conjugationLiterals, infinitiveLiteral, scope, seek)])
// // }
