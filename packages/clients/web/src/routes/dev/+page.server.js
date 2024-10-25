import tags from "./data/tags.js";
// export async function load(params) {
export const load = async ({ route, locals, ...params }) => {
  // console.log("load", route, params);
  // const { data: tags, error } = await locals.supabase
  //   .from("Tag")
  //   .select("*")
  //   .contains("traits", ["ONTOLOGICAL"]);

  return { tags: tags.filter((t) => t.runtimeId === "106bc87d-e20b-41ab-b222-463e8806944e") };
};
