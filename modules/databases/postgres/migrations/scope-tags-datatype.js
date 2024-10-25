import fs from "fs";
import supabase from "../clients/supabase.js";
import { fetchData } from "../clients/pg.js";

async function scope() {
  const START = 0;
  const TAKE = 5000;
  const BATCHSIZE = 100;
  let index = START;

  // const query = ` SELECT tag.* FROM public."Tag" AS tag ORDER BY tag."createdAt"; `; const result = await fetchData(query);

  const { data: tags } = await supabase
    .from("Tag")
    .select("*")
    .order("createdAt", { ascending: true })
    .range(START, TAKE);

  const promises = [];

  for (const tag of tags) {
    promises.push(
      (async (tag, index) => {
        try {
          const { data } = await supabase
            .from("Tag")
            .update({
              data: tag.type.reduce((acc, type) => {
                acc[type] = tag.data;
                return acc;
              }, {}),
            })
            .eq("id", tag.id);
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
          }
        }
      })(tag, index),
    );
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${tags.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);
}

await scope();
