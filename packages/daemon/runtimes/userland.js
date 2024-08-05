export default async function userland({ runtimes, supabase, ...params }) {
  for (const runtime of runtimes.values()) {
    delete runtime.locals.supabase;
    runtimes.set(runtime["#symbol"], runtime);
  }

  return { runtimes, supabase, ...params };
}
