import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode, ctx) => {
  // output entity keys are entity names — merge every kind a local repo exists for,
  // so the fold accumulates managed instances, never wire pojos
  const merge = async (yielded) => {
    for (const [name, pojos] of Object.entries(yielded.output)) {
      if (name === "message" || name === "object") continue;
      if (!Array.isArray(pojos)) continue;
      const repository = ctx.daemon.entities[name];
      if (!repository) continue;
      yielded.output[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
    }
  };

  const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
    await next();

    const body = rqx.response?.body;

    if (body?.[Symbol.asyncIterator] && !body.getReader) {
      rqx.response.body = (async function* () {
        for await (const packet of body) {
          if (packet?.event === "/tool/yield" && is.yieldish(packet.result)) {
            await merge(packet.result);
          }
          yield packet;
        }
      })();
      return;
    }

    if (!is.yieldish(body)) return;

    await merge(body);
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");
  mode.harness = shape.connection.wire(harness, mode.metadata.harness);
};
