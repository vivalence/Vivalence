import { json } from "@sveltejs/kit";
import * as ebisu from "$lib/ebisu";

export async function POST({ fetch, locals, request }) {
    try {
        const { tagIds, take } = await request.json();

        let { data: tags, error } = await locals.post("/api/tags/fromTagIds", { tagIds });
        if (error) throw error;

        const getMemory = async (tag) => {
            const { data, error } = await locals.supabase
                .from("Tag")
                .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
                .eq("id", tag.id)
                .filter("Memory.unitId", "is", null)
                .single();
            if (error) throw error; // TODO: not handling this RN
            tag = { ...tag, memory: data.Memory[0] };
            delete tag.Memory;

            if (tag.memory)
                tag.memory.strength = ebisu.predictRecallNow(tag.memory.state, tag.memory.lastSeen);
            return tag;
        };
        tags = await Promise.all(tags.map(getMemory));
        let weakestTags = tags.filter((tag) => !tag.memory);

        if (take) weakestTags = weakestTags.slice(0, take);
        if (!take || weakestTags.length < take) {
            tags = tags
                .filter((tag) => tag.memory)
                .sort((a, b) => a.memory.strength > b.memory.strength);
            if (take) tags = tags.slice(0, take - weakestTags.length);
            weakestTags.push(...tags);
        }

        return json({ data: weakestTags, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/tags/weakest:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
