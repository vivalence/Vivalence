import { shape, is } from "@vivalence/typology";

export const HARNESSED = async (mode, ctx) => {
  const buffers = ctx.daemon.entities.buffer;

  const harness = mode.connection.branch("/harness").use(async (rqx, next) => {
    await next();
    const body = rqx.response?.body;
    if (is.yieldish(body) && body.buffers?.length) {
      body.buffers = await Promise.all(
        body.buffers.map((pojo) => ctx.daemon.entities.buffer.merge(pojo)),
      );
    }
  });

  mode.metadata.harness = await mode.connection.call("/metadata/harness");

  mode.harness = shape.connection.wire(harness, mode.metadata.harness);
};
