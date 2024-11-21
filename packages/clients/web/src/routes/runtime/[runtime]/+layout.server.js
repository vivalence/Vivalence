export async function load({ locals, route, params }) {
  const { data: runtime, error } = await locals.call("/api/user/runtime/view", {
    runtime: { slug: params.runtime },
  });

  return { runtime };
}
