export function websocket(handler) {
  const fn = (ctx) => {
    const { socket, response } = Deno.upgradeWebSocket(ctx.request.raw);
    handler(socket, ctx);
    return response;
  };
  Object.defineProperty(fn, "length", { value: 1 });
  fn.websocket = true;
  return fn;
}
