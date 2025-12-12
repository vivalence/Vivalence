import { redirect } from "@sveltejs/kit";
import { Connection } from "@vivalence/typology";
import { lighthouse, remotes } from "$client";

export const load = async () => {
  console.log("load");
  if (!lighthouse.isIdentified.get()) {
    console.log("auth throw");
    return;
    console.log("THROW");
    throw redirect(307, "/");
  }

  // const daemons = await lighthouse.connection.call("/entities/daemon/find", {});
  // console.log("daemons from lh", daemons);

  // for (const remote of daemons) {
  //   const exists = await remotes.daemon //
  //     .findOne((d) => d.connection.url === remote.url);

  //   if (exists) continue;

  //   const connection = new Connection(remote.url) //
  //     .use(authorize(lighthouse.$authority));

  //   await remotes.daemon.spawn(connection);
  // }
};
