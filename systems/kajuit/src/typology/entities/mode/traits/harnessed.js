import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode, ctx) => {
  // yield entities are keyed by entity name — merge every kind a local repo exists for
  const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
    await next();

    if (!is.yieldish(rqx.response?.body)) return;

    const yielded = rqx.response?.body;

    for (const [name, pojos] of Object.entries(yielded.entities)) {
      const repository = ctx.daemon.entities[name];
      if (!repository) continue;
      yielded.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
    }
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");
  mode.harness = shape.connection.wire(harness, mode.metadata.harness);
};
