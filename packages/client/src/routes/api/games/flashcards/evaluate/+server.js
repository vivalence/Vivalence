import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals: { post }, request }) {
    try {
        const {
            evaluate: { unit, game },
            response
        } = await request.json();

        const { data, error } = await post("/api/units", {
            gameType: "FLASHCARDS",
            gameId: game.id,
            unitId: unit.id,
            response
        });
        // TODO tags

        if (error) throw error;

        return json({ data: data, status: 200 });
    } catch (error) {
        console.error("[REVIEW ERROR] /api/games/flashcards/evaluate", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
