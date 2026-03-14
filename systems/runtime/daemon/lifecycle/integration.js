import { sleep, Url, Connection, ConnectionError } from "@vivalence/typology";
import { context } from "@vivalence/vector/aperture";

// export async function domain(die) {if (is.fn(die.variant.modes.domain.aperture)) await die.variant.modes.domain.aperture(die.good.aperture);}

export async function call(die) {
  const composed = await die.good.aperture.compose(true);

  die.connection = new Connection(new Url("http://internal"), async (ctx) => {
    // UGLY! and technically wrong
    try {
      ctx.input = ctx.input || ctx.request.body;
      await composed(ctx);
      ctx.response.body = ctx.output;
      // console.log({ output: ctx });
      if (ctx.response.body && ctx.response.status === 404) ctx.response.status = 200;
      else if (ctx.response.status === 404) ctx.response.setError();
    } catch (error) {
      console.error("@runtime/daemon/integration");
      console.error({ ctx: { input: ctx.input, output: ctx.output } });
      console.error(error);
      ctx.response.status = 500;
      ctx.response.error = error;
    }
  });
}

export async function uninstall(daemonDie) {
  const installed = await daemonDie.good.entities.mode.find({});
  const loadedIds = new Set(daemonDie.good.flatmodes().map(({ entity }) => entity.id));

  for (const mode of installed) {
    if (!loadedIds.has(mode.id)) {
      const entity = await daemonDie.good.entities.mode.findOneOrFail({ id: mode.id });
      await daemonDie.good.entities.mode.getEntityManager().removeAndFlush(entity);
    }
  }

  await daemonDie.good.entities.em.flush();
}
