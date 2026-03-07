import { object } from "@vivalence/typology";

export const VALENTIC = async (mode, daemon) => {
  for (const valencePojo of mode.cake.dataset.entities["valence"]) {
    valencePojo.mode = { id: mode.entity.id };
    const valence = await daemon.entities.valence.ensure(valencePojo);

    mode.aperture
      .branch("/valence") //
      .use(async (ctx, next) => {
        ctx.valence = valence;
        await next();
      })
      .use(async (ctx, next) => {
        ctx.input.scope = object.merge({ commissioner: ctx.valence.mode.id }, ctx.input.scope, {
          valence: ctx.valence.id,
        });
        await next();

        // ctx.output.products = await Promise.all(
        //   ctx.output.products.map(async (product) => {
        //     product.mode = await daemon.entities.mode.findOne({id: product.producer.id ?? product.producer,});
        //     return product;
        //   }),
        // );
        // console.log("VALENCE RESPONSE", ctx.response.body);
      })
      .open(`/${valence.slug}`, async (ctx) => {
        const mount = ctx.mode.mount.barf().branch(ctx.valence.data.GENERATIVE["mount"]).absolute;
        const input = object.merge(ctx.valence.data.GENERATIVE["mask"], ctx.input);
        const result = await ctx.daemon.call(mount, input);
        // console.log({ result });
        return result;
      });
  }

  await daemon.entities.em.flush();
};
