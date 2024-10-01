import { handle } from "../hooks.client.js";

export const load = async (event) => {
  const { data, locals } = await handle(event);

  const { data: tags, error } = await locals.supabase
    .from("Tag")
    .select(`*, runtime:Runtime (*)`)
    .contains("traits", ["DEPENDENCY"]);

  if (error) console.error(error);

  return { ...data, locals, tags };
};
