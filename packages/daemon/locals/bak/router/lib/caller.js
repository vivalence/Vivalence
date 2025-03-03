import { join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { compose } from "oak/middleware";

import notFoundMiddleware from "../../middlewares/notFound.js";

export default function createScopedCallMethod({ runtime, ...requestContext }) {
  // return function createCall(requestContext) {
  return async function call(path, body = {}, params = {}) {
    // console.log("CALLER"); console.log(config.env.get("VIVA_DAEMON_URL"), path);
    // console.log(path);
    // console.log(new URL(join(config.env.get("VIVA_DAEMON_URL"), path)));

    const ctx = {
      state: requestContext ? { ...requestContext.state } : {},
      locals: requestContext ? { ...requestContext.locals } : {},
      cookies: requestContext && requestContext.cookies ? requestContext.cookies : new Map(),
      request: {
        ...(requestContext ? { ...requestContext.request } : {}),
        method: params.method || "POST",
        body: { json: async () => body },
        headers: requestContext?.request?.headers || new Headers(),
        // url: new URL(join(config.env.get("VIVA_DAEMON_URL"), path)),
        url: new URL(path, config.env.get("VIVA_DAEMON_URL")),
        // url: path,
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
