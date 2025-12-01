import { redirect } from "@sveltejs/kit";
import { Connection } from "@vivalence/typology";
import { lighthouse, remotes } from "$client";

const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();
};

export const load = async () => {
  if (!lighthouse.isIdentified.get()) {
    return;
    console.log("THROW");
    throw redirect(307, "/");
  }

  const daemons = await lighthouse.call("/entities/daemon/find", {});
  // console.log("daemons", daemons);

  for (const remote of daemons) {
    const exists = await remotes.daemon //
      .findOne((d) => d.connection.url === remote.url);

    if (exists) continue;

    const connection = new Connection(remote.url) //
      .use(authorize(lighthouse.$authority));

    await remotes.daemon.spawn(connection);
  }
};
