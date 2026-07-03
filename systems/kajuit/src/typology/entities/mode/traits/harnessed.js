import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode, ctx) => {
  // yield entities are keyed by entity name — merge every kind a local repo exists for
  const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
    await next();
    const body = rqx.response?.body;
    if (is.yieldish(body)) {
      for (const [name, pojos] of Object.entries(body.entities)) {
        const repository = ctx.daemon.entities[name];
        if (!repository) continue;
        body.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
      }
    }
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");

  mode.harness = shape.connection.wire(harness, mode.metadata.harness);
};
