import { json } from "@sveltejs/kit";
import { getWeakestTags } from "../../lib";

export async function POST({ fetch, locals, request }) {
  try {
    let { tags, take } = await request.json();

    let units = await Promise.all(units.map(getUnitMemory(locals)));
    // getTagMemory

    return json({ data: weakestTags, status: 200 });
  } catch (err) {
    console.error(`[ERROR] /api/memory/weakest/tags:\n`, err.message);
    console.error(err);
    return json({ status: 500, error: err });
  }
}
