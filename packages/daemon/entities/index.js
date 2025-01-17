// import { type EntityManager, type EntityRepository, type Options } from "@mikro-orm/sqlite";
// import { MikroORM } from "@mikro-orm/sqlite";
// import config from "../mikro-orm.config.ts";
// import { Test, TestSchema } from "./entities/test/test.entity.ts";

// export interface Services {orm: MikroORM; em: EntityManager; test: EntityRepository<Test>;}

import { entities } from "@vivalence/schema";

async function init(daemon) {
  const orm = await MikroORM.init({
    ...config,
    ...options,
    entities: [...entities],
  });

  // const db = await initORM({});
  // const em = db.em.fork();
  // const tests = await em.findOne(Test, 1);

  // fork.
  // need to inject request middleware into the runtime.router for em forking.

  // here is also where i facilitate the domain entity customization,
  // and the embedded types.

  return {
    orm,
    em: orm.em,
  };
}

export default { init };
