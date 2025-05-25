export default async function getUnitsByAnnotation({ annotation }, ctx) {
  // if (["space", "sym", "x"].includes(annotation.pos)) return null;
  // return await getUnit(annotation, ctx);
  return await ctx.runtime.entities.unit.findOne({ annotation });
}

// legacy:
async function getUnit(annotation, ctx) {
  let query = { lemma: annotation.lemma };

  switch (annotation.pos) {
    case "pron":
    case "det":
      query = querybuilders.prontypes(query, annotation);
      break;
    case "verb":
    case "aux":
      query = querybuilders.verbs(query, annotation);
      break;
    default:
      query = querybuilders.default(query, annotation);
  }

  return await ctx.runtime.entities.unit.findOne({ annotation: query });
}

// TODO: resolve from topography
const querybuilders = {
  prontypes: function (query, annotation) {
    query.prontype = annotation.prontype;

    if (annotation.prontype === "prs") {
      query.person = annotation.person;
      query.number = annotation.number;
    }

    if (annotation.prontype === "art") {
      query.gender = annotation.gender;
      query.number = annotation.number;
    }

    ["definite", "prepcase", "reflex", "poss"].forEach((key) => {
      if (annotation[key]) {
        query[key] = annotation[key];
      } else {
        query[key] = null;
      }
    });

    return query;
  },

  verbs: function (query, annotation) {
    query.verbform = annotation.verbform;
    query.suffix = annotation.suffix;

    if (annotation.verbform === "fin") {
      query.mood = annotation.mood;
      query.tense = annotation.tense;
      query.person = annotation.person;
      query.number = annotation.number;
    }

    return query;
  },

  default: function (query, annotation) {
    query.pos = annotation.pos;
    return query;
  },
};

// function makeUnits(data, annotation) {
//   return data
//     // .map((unit) => {unit.tags = makeTags(unit, annotation); return unit;})
//     // .sort((a, b) => b.tags.length - a.tags.length);
// }

// function makeTags(unit, annotation) {return unit.tags .map(({ tag }) => tag) .filter((tag) => tag.traits.includes("ONTOLOGICAL") && tag.data.ONTOLOGICAL?.branch) .filter((tag) => annotation[tag.data.ONTOLOGICAL.branch] && annotation[tag.data.ONTOLOGICAL.branch] === tag.data.ONTOLOGICAL.leaf,);}
