export default async function parseBody(ctx) {
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
    console.error("[ERROR] aperture.parse safeParseString", { str });
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
