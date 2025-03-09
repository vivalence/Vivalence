export function createHandler(options) {
  const { description, execute } = options;

  const handler = async (ctx) => {
    return await execute(ctx);
  };

  handler.meta = {
    description,
    options,
  };

  return handler;
}
