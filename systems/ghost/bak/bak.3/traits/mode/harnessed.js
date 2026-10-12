import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode) => {
  const { repositoryMap } = mode.runtime.entities.em;
  const merge = async (yielded) => {
    for (const [name, pojos] of Object.entries(yielded.output)) {
      if (!Array.isArray(pojos) || !Object.hasOwn(repositoryMap, name)) continue;
      yielded.output[name] = await Promise.all(pojos.map((pojo) => repositoryMap[name].merge(pojo)));
    }
  };

  const harness = mode.connection.branch("/harness").use(async (context, next) => {
    await next();

    const body = context.response?.body;

    if (body?.[Symbol.asyncIterator] && !body.getReader) {
      context.response.body = (async function* () {
        for await (const packet of body) {
          if (packet?.event === "/tool/yield" && is.yieldish(packet.result)) await merge(packet.result);
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
