import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
  try {
    const { scope } = await request.json();

    const hydrateToken = async (token) => {
      const tokenIds = token.tags.map(({ id }) => id);
      const [{ data: unit, error: unitError }, { data: tags, error: tagsError }] = await Promise.all([
        locals.supabase.from("Unit").select("id, data").eq("id", token.id).single(),
        locals.supabase.from("Tag").select("id, data, type, name").in("id", tokenIds),
      ]);
      if (unitError || tagsError) throw unitError || tagsError;
      return { ...token, ...unit, tags };
    };

    const results = await Promise.all(scope.units.map(hydrateToken));

    return json({ data: results });
  } catch (err) {
    console.error(`[ERROR] /api/units/hydrateScope:\n`, err.message);
    console.error(err);
    return json({ status: 500, error: err });
  }
}
