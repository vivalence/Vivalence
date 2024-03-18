import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals: { post }, request }) {
    try {
        const { gameId, unitId, response } = await request.json();

        const { data, error } = await post("/api/units", {
            gameId,
            gameType: "FLASHCARDS",
            unitId,
            response
        });

        if (error) throw error;

        return json({ data: data, status: 200 });
    } catch (error) {
        console.error("[REVIEW ERROR] /api/games/flashcards/review", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
