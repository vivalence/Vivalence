export default async function ({ annotation }, locals) {
  if (["space", "sym", "x"].includes(annotation.pos)) {
    return null;
  }

  let units = await byUnitData({ annotation }, locals);

  if (units.length > 1) {
    const token = annotation.meta.token.toLowerCase();
    const unit = units.find((u) => u.data.spanish.toLowerCase() === token);
    if (unit) units = [unit];
  }

  if (units.length === 0) {
    console.log("\n\n[FROM ANNOTATION]\ncould not find by unit data\n", annotation);
    throw new Error("could not find by unit data");
  } else if (units.length > 1) {
    console.log(
      "\n\n[FROM ANNOTATION]\nfound multiple units by unit data\n",
      annotation,
      units,
    );
    throw new Error("found multiple units by unit data");
  }

  return units[0];
}

async function byUnitData({ annotation }, { supabase }) {
  let query = supabase
    .from("Unit")
    .select(`*, _TagToUnit(*, Tag: A (*))`)
    .eq("data->annotation->>lemma", annotation.lemma);

  if (["pron", "det"].includes(annotation.pos)) {
    query = query.eq("data->annotation->>prontype", annotation.prontype);

    if (annotation.prontype === "prs") {
      query = query
        .eq("data->annotation->>person", annotation.person)
        .eq("data->annotation->>number", annotation.number);
    }
    if (annotation.prontype === "art") {
      query = query
        .eq("data->annotation->>gender", annotation.gender)
        .eq("data->annotation->>number", annotation.number);
    }

    ["definite", "prepcase", "reflex", "poss"].forEach((key) => {
      if (annotation[key]) query = query.eq(`data->annotation->>${key}`, annotation[key]);
      else query = query.is(`data->annotation->>${key}`, null);
    });
  }

  if (["verb", "aux"].includes(annotation.pos)) {
    query = query.eq("data->annotation->>verbform", annotation.verbform);
    if (annotation.verbform === "fin") {
      query = query
        .eq("data->annotation->>mood", annotation.mood)
        .eq("data->annotation->>tense", annotation.tense)
        .eq("data->annotation->>person", annotation.person)
        .eq("data->annotation->>number", annotation.number);
    }
  } else query = query.eq("data->annotation->>pos", annotation.pos);

  const { data, error } = await query;
  if (error) throw error;

  let units = [];
  data.map((unit) => {
    unit.tags = unit._TagToUnit
      .map(({ Tag }) => Tag)
      .filter((tag) => tag.type.includes("ONTOLOGICAL") && tag.data.ONTOLOGICAL?.branch)
      .filter(
        (tag) =>
          annotation[tag.data.ONTOLOGICAL.branch] &&
          annotation[tag.data.ONTOLOGICAL.branch] === tag.data.ONTOLOGICAL.leaf,
      );

    delete unit._TagToUnit;
    return unit;
  })
    .sort((a, b) => b.tags.length - a.tags.length)
    .forEach((unit) => units.push(unit));

  return units;
}

// if (!units || units.length === 0) {console.log("could not find by unit data", annotation); units = await byTags({ annotation }, locals); // }
// async function byTags({ annotation }, { supabase }) {let query = supabase .from("Unit") .select(`*, _TagToUnit(*, Tag: A (*))`) .eq("data->annotation->>lemma", annotation.lemma) .eq("data->annotation->>pos", annotation.pos); const filterTags = Object.keys(annotation) .filter((key) => !["lemma", "meta"].includes(key)) .filter((key) => annotation[key]) .map((key) => annotation[key]); query = query .in("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", filterTags) .not("_TagToUnit.Tag", "is", null); const { data, error } = await query; if (error) {console.log("byTags query error", error); throw error;} const units = data .map((unit) => {unit.tags = unit._TagToUnit .map(({ Tag }) => Tag) .filter((tag) => tag.type.includes("ONTOLOGICAL") && tag.data.ONTOLOGICAL?.branch) .filter((tag) => annotation[tag.data.ONTOLOGICAL.branch] && annotation[tag.data.ONTOLOGICAL.branch] === tag.data.ONTOLOGICAL.leaf); delete unit._TagToUnit; return unit;}) .sort((a, b) => b.tags.length - a.tags.length); return units;}
