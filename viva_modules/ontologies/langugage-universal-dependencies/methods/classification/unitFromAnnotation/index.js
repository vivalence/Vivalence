export default async function ({ annotation }, ctx) {
  if (["space", "sym", "x"].includes(annotation.pos)) {
    return null;
  }

  let units = await getUnit(annotation, ctx);

  if (units.length > 1) {
    const token = annotation.meta.token.toLowerCase();
    const unit = units.find((unit) => unit.data.learning.toLowerCase() === token);
    if (unit) units = [unit];
  }

  if (units.length === 0) {
    console.log("\n\n[FROM ANNOTATION]\ncould not find by unit data\n", annotation);
  } else if (units.length > 1) {
    console.log("\n\n[FROM ANNOTATION]\nfound multiple units by unit data\n", annotation, units);
  }

  return units[0];
}

async function getUnit(annotation, ctx) {
  const data = await runQuery(annotation, ctx);
  return makeUnits(data, annotation);
}

async function runQuery(annotation, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Unit")
    .select(`*, tags: _TagToUnit(*, tag: A (*))`)
    .eq("runtimeId", ctx.runtime.manifest.id);

  query = query.eq("annotation->>lemma", annotation.lemma);

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

  const { data, error } = await query;
  if (error) throw error;

  return data;
}

function makeUnits(data, annotation) {
  return data
    .map((unit) => {
      unit.tags = makeTags(unit, annotation);
      return unit;
    })
    .sort((a, b) => b.tags.length - a.tags.length);
}

function makeTags(unit, annotation) {
  return unit.tags
    .map(({ tag }) => tag)
    .filter((tag) => tag.traits.includes("ONTOLOGICAL") && tag.data.ONTOLOGICAL?.branch)
    .filter(
      (tag) =>
        annotation[tag.data.ONTOLOGICAL.branch] &&
        annotation[tag.data.ONTOLOGICAL.branch] === tag.data.ONTOLOGICAL.leaf,
    );
}

const querybuilders = {
  prontypes: function (query, annotation) {
    query = query.eq("annotation->>prontype", annotation.prontype);

    if (annotation.prontype === "prs") {
      query = query
        .eq("annotation->>person", annotation.person)
        .eq("annotation->>number", annotation.number);
    }
    if (annotation.prontype === "art") {
      query = query
        .eq("annotation->>gender", annotation.gender)
        .eq("annotation->>number", annotation.number);
    }

    ["definite", "prepcase", "reflex", "poss"].forEach((key) => {
      if (annotation[key]) query = query.eq(`annotation->>${key}`, annotation[key]);
      else query = query.is(`annotation->>${key}`, null);
    });
    return query;
  },
  verbs: function (query, annotation) {
    query = query.eq("annotation->>verbform", annotation.verbform);
    if (annotation.verbform === "fin") {
      query = query
        .eq("annotation->>mood", annotation.mood)
        .eq("annotation->>tense", annotation.tense)
        .eq("annotation->>person", annotation.person)
        .eq("annotation->>number", annotation.number);
    }
    return query;
  },
  default: function (query, annotation) {
    return query.eq("annotation->>pos", annotation.pos);
  },
};
