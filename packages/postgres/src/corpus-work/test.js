import fs from "fs";
import supabase from "../clients/supabase.js";
import { fetchData } from "../clients/pg.js";

async function scope() {
  const START = 0;
  const TAKE = 5000;
  const BATCHSIZE = 100;
  let index = START;

  const query = ` SELECT tag.* FROM public."Tag" AS tag ORDER BY tag."createdAt"; `;
  let tags = await fetchData(query);
  tags = tags.filter((t) => t.data.ONTOLOGICAL);
  tags = tags.filter((t) => !t.data.ONTOLOGICAL.leaf);

  // console.log(JSON.stringify(result[0], null, 2));
  tags.forEach((t) => {
    const { id, name, data } = t;
    let type = `${data.ONTOLOGICAL.leaf} ${data.ONTOLOGICAL.branch}`;
    console.log(`${id}       ${name}                    ${type}`);
  });

  // const { data: tag } = await supabase
  //   .from("Tag")
  //   .select(`*, _TagToUnit(*, Unit: B (*))`)
  //   .eq("id", "clrzaz72c000mg0jssrfxuk9o")
  //   .single();

  // console.log(tag._TagToUnit.length);
  // // return;
  // for (const [i, relation] of tag._TagToUnit.entries()) {
  //   const { error } = await supabase
  //     .from("Unit")
  //     .delete()
  //     .eq("id", relation.Unit.id);
  //   console.log(i, error);
  // }
}

await scope();

// https://stanza.vivalence.com/nlp
// {
//   "language": "es",
//   "text": "Las ventanas abiertas.",
//   "processors": "tokenize,mwt,pos,lemma,depparse"
// }
