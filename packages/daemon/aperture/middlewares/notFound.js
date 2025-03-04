export default async function notFoundMiddleware(ctx, next) {
  const originalStatus = ctx.response.status;
  const originalBody = ctx.response.body;

  await next();

  if (ctx.response.status !== originalStatus || ctx.response.body !== originalBody) {
    ctx.response.status = ctx.response.status === 404 ? 404 : ctx.response.status || 200;
  } else {
    ctx.response.status = 404;
    ctx.response.body = "URL Not Found";
  }
}
