import { json } from "@sveltejs/kit";

export async function POST({ locals, params, request }) {
  try {
    const session = await locals.getSession();
    if (!session) throw redirect(307, "/auth");

    const { queueId } = await request.json();

    const deleteRequest = await locals.supabase.from("Queue").delete().eq("id", queueId);
    if (deleteRequest.error) throw deleteRequest.error;

    return json({ status: deleteRequest.status });
  } catch (error) {
    console.error("[INSTRUCTIONS DELETE ERROR] /api/instructions/delete", error.message);
    console.error(error);
    return json({ error, status: 500 });
  }
}
