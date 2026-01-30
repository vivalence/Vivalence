import paladin from "@vivalence/paladin";
import { sleep, Url, Connection } from "@vivalence/typology";
import { context } from "@vivalence/vector/aperture";

// export async function domain(die) {if (is.fn(die.variant.modes.domain.aperture)) await die.variant.modes.domain.aperture(die.good.aperture);}

// .use(notFoundMiddleware)
export async function call(die) {
  // die.good.aperture.open("/some/test", () => {console.log("/some/test/"); return { some: "test" };});

  const composed = await die.good.aperture.compose(true);

  die.connection = new Connection(new Url("http://internal"), async (ctx) => {
    // UGLY!
    // ctx.internal = true;
    ctx.input = ctx.input || ctx.request.body;
    await composed(ctx);
    ctx.response.body = ctx.output;
    if (ctx.response.body) ctx.response.status = 200;
  });

  // die.good.call = async (path, body = {}, params = {}) => {
  //   const ctx = context(path, body, params);
  //   await composed(ctx);
  //   if (ctx.response.status === 404) console.log("[404]", ctx.request);
  //   return ctx.response.body;
  // };

  // die.good.call = die.good.connection.call.bind(die.good.connection);
  // (async () => {await sleep.seconds(2); const output = await die.good.call("/some/test"); console.log("callback output /some/test", { output });})();
}
