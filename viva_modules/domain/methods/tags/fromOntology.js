//   Tag = {
//   "id": "clpwfwpfp000lg0n1q9872y8x",
//   "data": {
//     "ONTOLOGICAL": {
//       "leaf": "ind",
//       "branch": "mood"
//     }
//   },
//   "name": "Indicative Mood",
//   "slug": "mood:ind",
//   "traits": [
//     "ONTOLOGICAL"
//   ]
// }

// find a Tag by data.ONTOLOGICAL leaf or branch or both
export default async function (body, ctx) {
  const { leaf, branch, take, blacklist } = body;

  let query = ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, data, name, slug, traits, runtimeId")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (leaf && branch) {
    query = query.eq("data->ONTOLOGICAL->>leaf", leaf).eq("data->ONTOLOGICAL->>branch", branch);
  } else if (leaf) {
    query = query.eq("data->ONTOLOGICAL->>leaf", leaf);
  } else if (branch) {
    query = query.eq("data->ONTOLOGICAL->>branch", branch);
  }
  if (take) {
    query = query.limit(take);
  }
  if (blacklist && blacklist.tags) {
    query = query.not("id", "in", `(${blacklist.tags.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Tag:", error);
    return { error: "Failed to fetch Tag" };
  }

  return data;
}
