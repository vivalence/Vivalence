import supabase from "../clients/supabase.js";

const referenceDate = new Date("2024-07-31T00:00:00.000Z");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const START = 0;
const TAKE = 200;
const BATCHSIZE = 1000;
const BATCHINTERVAL = 1000;
let index = START;

async function scope() {
  const response = await supabase
    .from("Tag")
    .select("*")
    .lte("updatedAt", referenceDate.toISOString())
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  if (response.error) return console.error(response.error);
  const tags = response.data;

  async function update(tag, index) {
    try {
      await supabase
        .from("Tag")
        .update({
          updatedAt: new Date(),
          runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
          traits: tag.type,
        })
        .eq("id", tag.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.error("[ERROR]", error, tag);
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
await scope();
