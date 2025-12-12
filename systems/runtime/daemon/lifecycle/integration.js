import paladin from "@vivalence/paladin";
import { Url, Connection } from "@vivalence/typology";
// import { Vector, compiler, controller, shards } from "@vivalence/vector";

// export async function domain(die) {if (is.fn(die.variant.modes.domain.aperture)) await die.variant.modes.domain.aperture(die.good.aperture);}

export async function call(die) {
  const composed = await die.good.aperture.compose(true);

  // .use(notFoundMiddleware)

  die.good.call = async (path, body = {}, params = {}) => {
    const ctx = context(path, body, params);
    await composed(ctx);
    if (ctx.response.status === 404) console.log("[404]", ctx.request);
    return ctx.response.body;
  };
}

// export async function domain(die) {
//   if (die.variant.modes.domain.lifecycle.integrate)
//     await die.variant.modes.domain.lifecycle.integrate(die.good);
// }
