export const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();

  console.log("ctx.response");
  console.log(ctx.response);
  // if(ctx.response.error === auth){
  //   await lighthouse.refresh();
  //   await ctx.retry()
  // }
};

export const backstop = (lighthouse) => async (ctx, next) => {
  await next();
  // if(ctx.response.error === auth){
  //   await lighthouse.logout();
  // }
};
