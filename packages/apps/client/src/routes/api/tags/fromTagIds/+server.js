import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
  try {
    const { tagIds = [], blacklist = [] } = await request.json();

    const { data: tags, error } = await locals.supabase
      .from("Tag")
      .select("*")
      .in("id", tagIds)
      .not("id", "in", `(${blacklist.join(",")})`);

    if (error) throw error;
    return json({ data: tags, status: 200 });
  } catch (err) {
    console.error(`[ERROR] /api/tags/fromTagIds:\n`, err.message);
    console.error(err);
    return json({ status: 500, error: err });
  }
}
