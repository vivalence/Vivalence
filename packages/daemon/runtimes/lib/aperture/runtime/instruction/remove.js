export default async function ({ scope }, ctx) {
  if (!scope.queue?.id) return { status: 404, error: "Queue not found" };

  const deleteRequest = await ctx.runtime.services.supabase //
    .from("Queue")
    .delete()
    .eq("id", scope.queue.id);

  if (deleteRequest.error) {
    console.error("[INSTRUCTIONS DELETE ERROR]", deleteRequest.error.message);
    console.error(deleteRequest.error);
    return {
      error: deleteRequest.error,
      status: 500,
    };
  }

  return {
    status: deleteRequest.status,
  };
}
