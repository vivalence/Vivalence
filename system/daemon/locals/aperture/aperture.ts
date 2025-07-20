import { Router, Middleware } from "oak";
import { compose } from "oak/middleware";
import { Path } from "@vivalence/shared";
import { Handler, ApertureContext } from "./types.ts";
import parser from "./parser.js";

export default class Aperture {
  path: Path;
  composed: any;
  router: Router;

  descendants: Aperture[] = [];
  middlewares: Middleware[];
  // handlers: any;

  constructor(path: Path) {
    this.path = path;
    this.router = new Router();
    this.middlewares = [];
  }

  use(middleware: Middleware): Aperture {
    this.router.use(middleware);
    // middleware.router = this;
    this.middlewares.push(middleware);
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
    const aperture = new Aperture(new Path(path, this.path));
    this.descendants.push(aperture);
    return aperture;
  }

  compose(force = false) {
    if (force) this.composed = null;

    if (!this.composed) {
      for (const descendant of this.descendants) {
        descendant.serve(this.router, force);
      }

      // console.log("f", force);
      this.composed = compose([
        ...this.middlewares,
        this.router.routes(),
        this.router.allowedMethods(),
      ]);
    }

    return this.composed;
  }
  serve(router: Router, force = false) {
    // const composed = this.compose();
    // router.use(this.path.toString(), composed);

    this.compose(force);

    // router.use(this.middleware);
    router.use(
      this.path.toString(),
      this.router.routes(),
      this.router.allowedMethods(),
    );
    return this;
  }
}
