import { shape, is } from "@vivalence/typology";

export const EMITTER = async (mode, ctx) => {
  const emit = mode.connection.branch("/emit");
  //.use(async (rqx, next) => {
  //   moved to mode.connection level - TESTWISE
  //   await next();
  //   const body = rqx.response?.body;
  //   console.log("[connection/emit]", { body }, is.yieldish(body));
  //   if (is.yieldish(body)) {
  //     for (const [name, pojos] of Object.entries(body.entities)) {
  //       const repository = ctx.daemon.entities[name];
  //       console.log({ repository });
  //       if (!repository) continue;
  //       body.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));
  //     }
  //   }
  // });
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
