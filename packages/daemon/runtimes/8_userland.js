export default async function userland(daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    delete runtime.locals.supabase;
    delete runtime.call;
    daemon.runtimes.set(key, runtime);
  }

  return daemon;
}
