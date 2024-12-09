const dependency = {
  name: "Introduction to Articles",
  slug: "articles-101",
  description: "",
  preconditions: [],
  conditions: [],
  itinerary: {
    tactic: {
      slug: "article-practice",
    },
  },
};

function makeCondition(tag, count) {
  dependency.conditions.push({
    name: tag.description + "in progress",
    scope: { tag: { slug: tag.slug } },
    assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= ${count}` },
  });
  dependency.conditions.push({
    name: tag.description + "familiar",
    scope: { tag: { slug: tag.slug } },
    assertion: { jsonata: `$count($[$ in ['KNOWN','GRADUATED']]) >= ${count}` },
  });
}

for (const tag of [
  { slug: "gender:masc", description: "Masculine form is " },
  { slug: "gender:fem", description: "Feminine form is " },
  { slug: "number:sing", description: "Singular form is " },
  { slug: "number:plur", description: "Plural form is " },
]) {
  makeCondition(tag, 5);
}
for (const tag of [
  { slug: "definite:def", description: "Definite form is " },
  { slug: "definite:ind", description: "Indefinite form is " },
]) {
  makeCondition(tag, 1);
}

export default dependency;
