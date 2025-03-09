export default function route(router) {
  return (path, ...args) => {
    if (args.length < 1) {
      throw new Error("At least a path and a handler are required");
    }

    if (typeof path !== "string") {
      throw new Error("Path must be a string");
    }

    const handler = args.pop();
    const middleware = args;

    if (typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    router.all(path, ...middleware, async (ctx) => {
      const body = await parseBody(ctx);
      try {
        const data = await handler(body, ctx);
        if (data && data.error) throw data.error;
        ctx.response.body = { data };
      } catch (error) {
        console.error("[ERROR] @router.route handler @", path);
        console.trace(error);

        ctx.response.body = { error };
        ctx.response.status = 500;
      }
    });
  };
}

async function parseBody(ctx) {
  const { method, body, headers = {} } = ctx.request;

  if (method === "GET") {
    return ctx.request.query || {};
  }

  if (!body) {
    return {};
  }

  try {
    switch (true) {
      case typeof body.json === "function":
        return await body.json();

      case typeof body === "object":
        return body;

      case typeof body === "string":
        return safeParseJson(body);

      default:
        return {};
    }
  } catch (error) {
    logError(error, ctx);
    return {};
  }
}

// Helper functions
const safeParseJson = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return { rawBody: str };
  }
};

const logError = (error, ctx) => {
  const { method, path } = ctx.request;
  console.error("Body Parse Error:", {
    error,
    method,
    path,
    contentType: ctx.request.headers["content-type"],
  });
};
