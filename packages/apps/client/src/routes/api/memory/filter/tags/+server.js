import { json } from "@sveltejs/kit";
import { getTagMemory } from "../../lib";

export async function POST({ fetch, locals, request }) {
    try {
        let { tags, accept } = await request.json();

        tags = await Promise.all(tags.map(getTagMemory(locals)));

        tags = tags.filter((tag) => {
            if (!tag.memory && accept.includes("UNKNOWN")) return true;
            if (accept.includes(tag.memory.status)) return true;
            return false;
        });

        return json({ data: tags, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/memory/filter/tags:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
