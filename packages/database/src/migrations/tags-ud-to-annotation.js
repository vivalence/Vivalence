import fs from "fs";
import supabase from "../clients/supabase.js";
import { fetchData } from "../clients/pg.js";
// import annotate from "/Users/finn/vivalence/code/app/packages/client/src/routes/api/classifier/parse/annotate.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scope() {
  const START = 0;
  const TAKE = 50000;
  const BATCHSIZE = 1000;
  const BATCHINTERVAL = 1000;
  let index = START;

  const response = await supabase
    .from("Tag")
    .select("*")
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE);

  if (response.error) return console.error(response.error);
  const tags = response.data.filter((t) => t.type.includes("ONTOLOGICAL"));

  async function update(tag, index) {
    try {
      tag.data.ONTOLOGICAL = tag.data.ONTOLOGICAL || {};
      tag.data.ONTOLOGICAL = {
        branch: tag.data.ONTOLOGICAL.branch || "",
        leaf: tag.data.ONTOLOGICAL.leaf || "",
      };
      tag.data.ONTOLOGICAL = {
        branch: tag.data.ONTOLOGICAL.branch.toLowerCase(),
        leaf: tag.data.ONTOLOGICAL.leaf.toLowerCase(),
      };
      if (tag.data.ONTOLOGICAL.branch === "upos") {
        tag.data.ONTOLOGICAL.branch = "pos";
      }

      await supabase
        .from("Tag")
        .update({
          updatedAt: new Date(),
          data: tag.data,
        })
        .eq("id", tag.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
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
await scope();
