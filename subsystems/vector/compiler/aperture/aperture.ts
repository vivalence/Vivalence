import { Router, Middleware } from "oak";
import { compose } from "oak/middleware";
import { Path } from "./path.ts";
import { Handler, ApertureContext } from "./types.ts";
import parser from "./parser.js";

export default class Aperture {
  path: Path;
  composed: any;
  router: Router;

  descendants: Aperture[] = [];
  middlewares: Middleware[];
  // handlers: any;
  router = new Router();
  middlewares = [];

  constructor(path: Path | null) {
    this.path = path ? path : new Path();
  }

  get json() {
    const path = this.path.toString() || "/";
    const routes = [
      ...new Set([...this.router.entries()].flat().map((e) => e.path)),
    ];
    const children = this.descendants.map((child) => child.json);
    if (routes.length === 0 && children.length === 0) return path;
    return { [path]: [...routes, ...children] };
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Aperture ${JSON.stringify(this.json, null, 2)}`;
  }

  use(middleware: Middleware): Aperture {
    this.router.use(middleware);
    // middleware.router = this;
    this.middlewares.push(middleware);
    return this;
  }

  open(path: string, handler: Handler): Aperture {
    const routePath = new Path(path, this.path);

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
