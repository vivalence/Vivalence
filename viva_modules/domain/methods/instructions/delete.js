export default async function ({ queueId }, ctx) {
  const deleteRequest = await ctx.runtime.locals.supabase.from("Queue").delete().eq("id", queueId);
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
