export function catchAndRelease(id) {
  const cache = new Map();
  const promises = new Map();

  return async (ctx, next) => {
    const hash = id(ctx);

    if (cache.has(hash)) {
      ctx.effect = cache.get(hash);
      return;
    }

    if (promises.has(hash)) {
      ctx.effect = await promises.get(hash);
      return;
    }

    const promise = (async () => {
      await next();
      cache.set(hash, ctx.effect);
      promises.delete(hash);
      return ctx.effect;
    })();

    promises.set(hash, promise);
    ctx.effect = await promise;
  };
}

// export function signalhash(
//   release = async (ctx) => JSON.stringify(ctx.params),
// ) {
//   return catchAndRelease((ctx) => ctx.signal?.hash || release(ctx));
// }
// export function catchAndRelease(id) {
//   const cache = new Map();
//   const promises = new Map();

//   return async (ctx, next) => {
//     const hash = id(ctx);

//     if (cache.has(hash)) {
//       ctx.effect = cache.get(hash);
//       return;
//     }

//     if (promises.has(hash)) {
//       ctx.effect = await promises.get(hash);
//       return;
//     }

//     const promise = (async () => {
//       await next();
//       cache.set(hash, ctx.effect);
//       promises.delete(hash);
//       return ctx.effect;
//     })();

//     promises.set(hash, promise);
//     ctx.effect = await promise;
//   };
// }
