import { shape, is } from "@vivalence/typology";

export const EMITTER = async (mode, ctx) => {
  const buffers = ctx.daemon.entities.buffer;

  const emit = mode.connection.branch("/emit").use(async (rqx, next) => {
    await next();
    const body = rqx.response?.body;
    if (is.yieldish(body)) {
      body.buffers = await Promise.all(body.buffers.map((pojo) => buffers.merge(pojo)));
    }
  });
  // const emit = mode.connection.branch("/emit").use(async (rqx, next) => {
  //   await next();
  //   const list = rqx.response?.body?.buffers;
  //   console.log("rqx", rqx, list);
  //   if (list) {
  //     rqx.response.body.buffers = await Promise.all(list.map((pojo) => buffers.merge(pojo)));
  //     console.log("rqx.response.body.buffers", rqx.response.body.buffers);
  //   }
  // });

  mode.metadata.emitter = await mode.connection.call("/metadata/emitter");

  mode.emit = shape.connection.wire(emit, mode.metadata.emitter);
};

// intent.emit = mode.connection
//   .clone()
//   .use(async (context, next) => {
//     await next();
//     const body = context.response.body;
//     if (body?.buffers) {
//       body.buffers = body.buffers.map((pojo) => {
//         pojo.mode = modeRepo.findOneLocal({ id: is.id(pojo.mode) ? pojo.mode : pojo.mode?.id }) ?? pojo.mode;
//         return pojo;
//       });
//     }
//   })
//   .aim(intent.trait.QUEUEING.mount, { intent: intent.id, ...(intent.trait.QUEUEING.mask ?? {}) });

// for (const mode of modes) {
//   object.place(daemon.modes, `${mode.type}.${mode.slug}`, mode);
// }
