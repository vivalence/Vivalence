import { Router, Middleware } from "oak";
import { compose } from "oak/middleware";
import { Handler, ApertureContext } from "./types.ts";
import Path from "./path.ts";
import parser from "./parser.js";

export default class Aperture {
  path: Path;
  composed: any;
  router: Router;

  descendants: Aperture[] = [];
  middleware: {
    native: Middleware[];
    pre: Middleware[];
    post: Middleware[];
  };
  // handlers: any;

  constructor(path: Path) {
    this.path = path;
    this.router = new Router();
    this.middleware = {
      native: [],
      pre: [],
      post: [],
    };
  }

  use(middleware: Middleware): Aperture {
    this.middleware.native.push(middleware);
    return this;
  }

  pre(middleware: Middleware): Aperture {
    this.middleware.pre.push(middleware);
    return this;
  }

  post(middleware: Middleware): Aperture {
    this.middleware.post.push(middleware);
    return this;
  }

  open(path: string, handler: Handler): Aperture {
    const routePath = new Path(path);

    this.router.all(routePath.toString(), async (ctx: ApertureContext) => {
      ctx.response.body = await handler(await parser(ctx), ctx);
    });

    return this;
  }

  branch(path: string): Aperture {
    const aperture = new Aperture(new Path(path));
    this.descendants.push(aperture);
    return aperture;
  }

  compose(force = false) {
    if (force) this.composed = null;

    if (!this.composed) {
      this.router.use(async (ctx, next) => {
        for (const middleware of this.middleware.pre) {
          await new Promise<void>((resolve) => {
            middleware(ctx, () => {
              resolve();
              return Promise.resolve();
            });
          });
        }
        await next();
      });

      for (const middleware of this.middleware.native) {
        this.router.use(middleware);
      }

      this.router.use(async (ctx, next) => {
        await next();
        for (const middleware of this.middleware.post) {
          await new Promise<void>((resolve) => {
            middleware(ctx, () => {
              resolve();
              return Promise.resolve();
            });
          });
        }
      });

      for (const descendant of this.descendants) {
        descendant.serve(this.router);
      }

      this.composed = compose([this.router.routes(), this.router.allowedMethods()]);
    }

    return this.composed;
  }
  serve(router: Router) {
    this.compose();
    router.use(this.path.toString(), this.router.routes(), this.router.allowedMethods());
    return this;
  }
}
