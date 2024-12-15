// (() => {
//   const dependency = {
//     name: "Introduction to Articles",
//     slug: "articles-101",
//     description: "",
//     preconditions: [],
//     conditions: [],
//     itinerary: { tactic: { slug: "article-practice" } },
//   };

//   function makeCondition(tag, count) {
//     dependency.conditions.push({
//       name: tag.description + "in progress",
//       scope: { tag: { slug: tag.slug } },
//       assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= ${count}` },
//     });
//     dependency.conditions.push({
//       name: tag.description + "familiar",
//       scope: { tag: { slug: tag.slug } },
//       assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= ${count}` },
//     });
//   }

//   for (const tag of [
//     { slug: "gender:masc", description: "Masculine form is " },
//     { slug: "gender:fem", description: "Feminine form is " },
//     { slug: "number:sing", description: "Singular form is " },
//     { slug: "number:plur", description: "Plural form is " },
//   ]) {
//     makeCondition(tag, 5);
//   }
//   for (const tag of [
//     { slug: "definite:def", description: "Definite form is " },
//     { slug: "definite:ind", description: "Indefinite form is " },
//   ]) {
//     makeCondition(tag, 1);
//   }

//   return dependency;
// })();

// const nounmodifiers1 = {
//   name: "First Contact: Noun Modifiers",
//   slug: "noun-modifiers:1",
//   description: "All Noun Modifiers are introduced",
//   preconditions: [],
//   conditions: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }].map((tag) => ({
//     name: `Aspect "${tag.slug.split(":")[0]}" is introduced`,
//     scope: { tag },
//     assertion: { jsonata: `$count($[$ = "UNTOUCHED"]) = 0` },
//   })),
//   itinerary: {
//     tactic: {
//       slug: "ontological-branch-introduction",
//       relations: {
//         tags: {
//           root: { slug: "pos:noun" },
//           aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
//         },
//       },
//       masks: {
//         // should force /ensure/guarantue enum
//         aspect: { memory: { accept: [null, "UNTOUCHED"] } },
//       },
//     },
//   },
// };

// const nounmodifiers2 = {
//   name: "Practice: Noun Modifiers",
//   slug: "noun-modifiers:2",
//   description: "20 Nouns and 5 of each Noun Modifier are known",
//   preconditions: [{ scope: { dependency: { slug: "noun-modifiers:1" } } }],
//   conditions: [
//     ...[
//       { name: "20 Nouns are known", slug: "pos:noun" },
//       { name: "20 Adjectives are known", slug: "pos:adj" },
//     ].map(({ name, slug }) => ({
//       name,
//       scope: { tag: { slug } },
//       assertion: { jsonata: "$count($[$ in ['KNOWN', 'GRADUATED']]) >= 20" },
//     })),

//     ...[
//       { slug: "gender:masc" },
//       { slug: "gender:fem" },
//       { slug: "number:sing" },
//       { slug: "number:plur" },
//       { slug: "definite:def" },
//       { slug: "definite:ind" },
//     ].map((tag) => ({
//       name: `Aspect "${tag.slug.replace(":", " ")}" is familiar`,
//       scope: { tag },
//       assertion: { jsonata: "$count($[$ in ['KNOWN', 'GRADUATED']]) >= 5" },
//     })),
//   ],
//   itinerary: {
//     tactic: { slug: "article-morphology-practice" },
//   },
// };

// export default [nounmodifiers1, nounmodifiers2];
