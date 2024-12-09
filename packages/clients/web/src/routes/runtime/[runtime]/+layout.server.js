export async function load({ aperture, params }) {
  const { data: runtime, error } = await aperture.call(`/runtime/${params.runtime}`);
  return { runtime };
}
