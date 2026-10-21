import { Vector, shard } from "@vivalence/typology";

export const bundle = async (appDie, next) => {
  const written = await appDie.surface.bundle();
  appDie.controller.stdout.log({ bundle: written.outfile, bytes: written.bytes });
  await next();
};

export const client = async (appDie, next) => {
  const ended = appDie.client.controller.settled.then(
    () => appDie.controller.abort.abort("client stopped"), //@beef ughly.ughly
  );
  try {
    await next();
  } finally {
    appDie.client.controller.abort.abort("app stopped");
    await ended;
  }
};

export const mount = async (appDie, next) => {
  const unmount = await appDie.surface.mount(appDie);
  try {
    await next();
  } finally {
    unmount();
  }
};

export const execution = new Vector()
  .use(shard.controller.open)
  .use(client)
  .use(bundle)
  .use(mount)
  .do(shard.controller.hold);
