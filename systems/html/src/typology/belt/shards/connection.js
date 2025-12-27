export const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();
};

// export const backstop = (lighthouse) => async (ctx, next) => {
//   let isRetry = false;
//   ctx.retry = async () => {
//     if (isRetry) throw new Error();
//     isRetry = true;
//     //

//     // ctx.response.body = await instance(endpoint, body, params);
//   };

//   await next();

// };
