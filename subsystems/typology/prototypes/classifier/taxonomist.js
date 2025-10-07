export function shard(taxonomist) {
  return async (ctx, next) => {
    // Inject cast function for recursive classification
    ctx.cast = {};
    // for () {

    // return await call(taxonomist, signal);
    // ctx.cast.text = (input) => call(taxonomist, `/text/${input}`, ctx),
    // token: (tokens) =>
    //   Promise.all(tokens.map((token) => call(taxonomist, `/token/${JSON.stringify(token)}`, ctx),),)
    // 	  .then((results) => results.flat().filter(Boolean)),

    // }

    await next();
  };
}
