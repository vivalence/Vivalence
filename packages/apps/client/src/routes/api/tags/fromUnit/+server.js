import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
  try {
    const { unit } = await request.json();

    const { data, error } = await locals.supabase
      .from("_TagToUnit")
      .select(`*, Tag: A (*)`)
      .eq("B", unit.id);
    if (error) throw error;

    const tags = data.map((tag) => tag.Tag);
    return json({ data: tags, status: 200 });
  } catch (err) {
    console.error(`[ERROR] /api/tags/fromUnit:\n`, err.message);
    console.error(err);
    return json({ status: 500, error: err });
  }
}
