import supabase from "../clients/supabase.js";

const referenceDate = new Date("2024-08-01T00:00:00.000Z");
const START = 0;
const TAKE = 120000;
const BATCHSIZE = 1000;
const BATCHINTERVAL = 1000;
let index = START;

async function slugTag() {
  const { data: tags, error } = await supabase
    .from("Tag")
    .select("*")
    .lte("updatedAt", referenceDate.toISOString())
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  async function update(tag, index) {
    try {
      let slug;
      if (tag.traits.includes("ONTOLOGICAL")) {
        slug = tag.data.ONTOLOGICAL.branch + "-" + tag.data.ONTOLOGICAL.leaf;
      } else if (tag.traits.includes("STRUCTURAL")) {
        slug = "structural-" + tag.name.toLowerCase().replace(" ", "-").replace(":-", ":");
      } else {
        slug = tag.name.toLowerCase().replace(" ", "-").replace(":-", ":");
      }

      console.log("slug", slug);

      await supabase.from("Tag").update({ updatedAt: new Date(), slug }).eq("id", tag.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.log("[ERROR]");
        console.log(error);
        console.log(tag);
      }
    }
  }

  const promises = [];
  for (const tag of tags) {
    promises.push(update(tag, index));
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      await Promise.all(promises);
      console.log(`batch: ${index / BATCHSIZE} / ${tags.length / BATCHSIZE}`);
    }
  }
  console.log("total ops:", promises.length);
  await Promise.all(promises);
}

const slugs = [];
let duplicates = 0;

async function slugUnit() {
  const { data: units, error } = await supabase
    .from("Unit")
    .select("*")
    // .lte("updatedAt", referenceDate.toISOString())
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  async function update(unit, index) {
    try {
      unit.slug = Object.keys(unit.annotation)
        .sort((a, b) => a.localeCompare(b))
        .reduce((slug, key) => {
          return slug + `-${unit.annotation[key]}`;
        }, `${unit.data.learning}`);

      if (slugs.includes(unit.slug)) {
        console.log("DUPLICATE", unit.slug);
        duplicates++;
      }
      slugs.push(unit.slug);

      await supabase
        .from("Unit")
        .update({ updatedAt: new Date(), slug: unit.slug })
        .eq("id", unit.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.log("[ERROR]");
        console.log(error);
        console.log(tag);
      }
    }
  }

  const promises = [];
  for (const unit of units) {
    promises.push(update(unit, index));
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      await Promise.all(promises);
      console.log(`batch: ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`);
    }
  }
  await Promise.all(promises);

  console.log("total ops:", promises.length);
  // return;
  // const duplicates = slugs.reduce((acc, curr) => {if (acc[curr]) {acc[curr]++;} else {acc[curr] = 1;} return acc;}, {}); for (const [key, value] of Object.entries(duplicates)) {if (value > 1) {console.log(key, value);}}
}

async function deduplicateUnits() {
  for (const unit of [...duplicates.slice(0, TAKE)]) {
    const result = await fetch(
      "http://localhost:5175/r/l-ud-eng2esp/diagnostics/duplicates/annotation",
      {
        method: "POST",
        body: JSON.stringify({ annotation: unit.annotation }),
      }
    );
    const json = await result.json();
    const issues = json.data.issues;

    for (const issue of issues) {
      const resultRemedy = await fetch("http://localhost:5175/r/l-ud-eng2esp/remedy", {
        method: "POST",
        body: JSON.stringify({ issue }),
      });
      console.log("remedy result", await resultRemedy.json());
    }
  }
}

// await slugUnit();
// await deduplicateUnits();

async function changeTagSlugSchema() {
  const { data: tags, error } = await supabase
    .from("Tag")
    .select("*")
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  async function update(tag, index) {
    try {
      await supabase
        .from("Tag")
        .update({ updatedAt: new Date(), slug: tag.slug.replace("-", ":") })
        .eq("id", tag.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.log("[ERROR]");
        console.log(error);
        console.log(tag);
      }
    }
  }

  const promises = [];
  for (const tag of tags) {
    promises.push(update(tag, index));
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      await Promise.all(promises);
      console.log(`batch: ${index / BATCHSIZE} / ${tags.length / BATCHSIZE}`);
    }
  }
  console.log("total ops:", promises.length);
  await Promise.all(promises);
}

async function changeUnitSlugSchema() {
  const { data: units, error } = await supabase
    .from("Unit")
    .select("*")
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  async function update(unit, index) {
    try {
      await supabase
        .from("Unit")
        .update({ updatedAt: new Date(), slug: unit.slug.replace("-", ":") })
        .eq("id", unit.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.log("[ERROR]");
        console.log(error);
        console.log(unit);
      }
    }
  }

  const promises = [];
  for (const unit of units) {
    promises.push(update(unit, index));
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      await Promise.all(promises);
      console.log(`batch: ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`);
    }
  }
  console.log("total ops:", promises.length);
  await Promise.all(promises);
}

// await changeTagSlugSchema();
await changeUnitSlugSchema();
