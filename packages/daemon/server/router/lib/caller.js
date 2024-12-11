import { join } from "$std/path/mod.ts";
import { compose } from "oak/middleware";
import config from "../../../../../config/src/mod.ts";

import notFoundMiddleware from "../../middlewares/notFound.js";

export default function createCall({ runtime, ...requestContext }) {
  // return function createCall(requestContext) {
  return async function call(path, body = {}, params = {}) {
    const ctx = {
      state: requestContext ? { ...requestContext.state } : {},
      locals: requestContext ? { ...requestContext.locals } : {},
      cookies: requestContext && requestContext.cookies ? requestContext.cookies : new Map(),
      request: {
        ...(requestContext ? { ...requestContext.request } : {}),
        method: params.method || "POST",
        body: { json: async () => body },
        headers: requestContext?.request?.headers || new Headers(),
        url: new URL(join(config.env.get("DAEMON_URL"), path)),
      },
      response: { body: {}, status: 404, headers: new Headers() },
      runtime: { ...runtime },
      ...(requestContext?.event ? { event: requestContext.event } : {}),
    };

    const composedMiddleware = compose([
      notFoundMiddleware,
      ...runtime.router.middleware,
      runtime.router.routes(),
      runtime.router.allowedMethods(),
    ]);

    await composedMiddleware(ctx);

    return ctx.response.body.data || ctx.response.body;
  };
}
// }
