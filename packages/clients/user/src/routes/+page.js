import { handle } from "../hooks.client.js";
import dependencies from "$lib/dependencies.js";

export const load = async (event) => {
  const { data, locals } = await handle(event);

  const { data: tags, error } = await locals.supabase
    .from("Tag")
    .select(`*, runtime:Runtime (*)`)
    .contains("traits", ["DEPENDENCY"]);

  if (error) console.error(error);

  for (const tag of tags) {
    await dependencies(tag, {
      runtime: {
        locals,
        manifest: tag.runtime,
      },
    });
  }

  return { ...data, locals, tags };
};
