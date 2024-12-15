const dependencies = [
  (() => {
    const dependency = {
      name: "Introduction to Articles",
      slug: "articles-101",
      description: "",
      preconditions: [],
      conditions: [],
      itinerary: {
        tactic: {
          slug: "article-practice",
          masks: { reps: 3 },
          relations: {
            tags: {
              gender: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
              number: [{ slug: "number:sing" }],
              definite: [{ slug: "definite:def" }],
            },
          },
        },
      },
    };

    function makeCondition(tag, count) {
      dependency.conditions.push({
        name: tag.description + "is in progress",
        scope: { tag: { slug: tag.slug } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= ${count}` },
      });
    }

    for (const tag of [
      { slug: "gender:masc", description: "Masculine form is " },
      { slug: "gender:fem", description: "Feminine form is " },
      { slug: "number:sing", description: "Singular form is " },
    ]) {
      makeCondition(tag, 3);
    }

    return dependency;
  })(),
  (() => {
    const dependency = {
      name: "Introduction to plural Articles",
      slug: "articles-102",
      description: "",
      preconditions: [{ scope: { dependency: { slug: "articles-101" } } }],
      conditions: [],
      itinerary: {
        tactic: {
          slug: "article-practice",
          relations: {
            tags: {
              gender: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
              number: [{ slug: "number:sing" }, { slug: "number:plur" }],
              definite: [{ slug: "definite:def" }],
            },
          },
        },
      },
    };

    function makeCondition(tag, count) {
      dependency.conditions.push({
        name: tag.description + "is in progress",
        scope: { tag: { slug: tag.slug } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= ${count}` },
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

    return dependency;
  })(),
  (() => {
    const dependency = {
      name: "Introduction to indefinite Articles",
      slug: "articles-103",
      description: "",
      preconditions: [{ scope: { dependency: { slug: "articles-102" } } }],
      conditions: [],
      itinerary: {
        tactic: {
          slug: "article-practice",
          masks: { reps: 3 },
          relations: {
            tags: {
              gender: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
              number: [{ slug: "number:sing" }, { slug: "number:plur" }],
              definite: [{ slug: "definite:def" }, { slug: "definite:ind" }],
            },
          },
        },
      },
    };

    function makeCondition(tag, count) {
      dependency.conditions.push({
        name: tag.description + "is in progress",
        scope: { tag: { slug: tag.slug } },
        assertion: { jsonata: `$count($[$ in ['LEARNING','KNOWN','GRADUATED']]) >= ${count}` },
      });
    }

    for (const tag of [
      { slug: "gender:masc", description: "Masculine form is " },
      { slug: "gender:fem", description: "Feminine form is " },
      { slug: "number:sing", description: "Singular form is " },
      { slug: "number:plur", description: "Plural form is " },
    ]) {
      makeCondition(tag, 10);
    }
    for (const tag of [
      { slug: "definite:def", description: "Definite form is " },
      { slug: "definite:ind", description: "Indefinite form is " },
    ]) {
      makeCondition(tag, 1);
    }

    return dependency;
  })(),
  (() => {
    const dependency = {
      name: "Articles with adjective agreement",
      slug: "articles-104",
      description: "",
      preconditions: [{ scope: { dependency: { slug: "articles-103" } } }],
      conditions: [],
      itinerary: {
        tactic: {
          slug: "article-practice",
          masks: {
            weakness_threshold: ["UNTOUCHED", "UNKNOWN"],
            translations: {
              prompt: {
                goal: `
The user is practicing the usage of Articles in spanish, and how nouns and adjectives agree with them.
Your task is to create a very short, concise and simple sentence, using specific vocabulary and following grammatical constraints.

Dont ever use vocabulary thats more advanced than whats provided.
Create very simple statements. Like a child would say or use for practice.
The statement is just there to practice the article, noun, and adjective. thats it. nothing more.
The English form must unambiguously indicate which Spanish article is expected.

You're given a list of nouns and adjectives, which serves as the available vocabulary. 
You're given grammatical constraints for: definiteness, gender, and number. 
The sentence must be simple, because a A1 language learner will translate that sentence for practice.
Important: the sentence must follow the provided grammar and vocabulary.

Aim for 3 to 5 words for the sentence. Dont ever go longer than 6 words.
Broadly follow a template like this: '[article] [noun] [adjective]'.

No verbs.
`,
              },
            },
          },
          relations: {
            tags: {
              adjectives: { slug: "pos:adj" },
              gender: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
              number: [{ slug: "number:sing" }, { slug: "number:plur" }],
              definite: [{ slug: "definite:def" }, { slug: "definite:ind" }],
            },
          },
        },
      },
    };

    function makeCondition(tag, count) {
      dependency.conditions.push({
        name: tag.description + "is known",
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
      makeCondition(tag, 10);
    }
    for (const tag of [
      { slug: "definite:def", description: "Definite form is " },
      { slug: "definite:ind", description: "Indefinite form is " },
    ]) {
      makeCondition(tag, 1);
    }

    return dependency;
  })(),
];
export default dependencies;
