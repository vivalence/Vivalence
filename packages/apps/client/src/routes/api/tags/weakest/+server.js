import { json } from "@sveltejs/kit";
import { getTagMemory, getWeakest } from "$api/memory/lib";

export async function POST({ request, locals, ...props }) {
    try {
        let { tags, tagIds, take } = await request.json();

        if (!tags && tagIds) {
            tags = await locals.client("tags/fromTagIds", { tagIds }).ok();
        }

        tags = await Promise.all(tags.map(getTagMemory(locals)));
        tags = getWeakest(tags, take);

        return json({ data: tags, error: null });
    } catch (err) {
        console.error(`ERROR /api/tags/weakest:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
