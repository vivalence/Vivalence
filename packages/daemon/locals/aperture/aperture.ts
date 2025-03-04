import { Router, Middleware } from "oak";
import { compose } from "oak/middleware";
import { Handler, ApertureContext } from "./types.ts";
import Path from "./path.ts";

export default class Aperture {
  path: Path;
  descendants: Aperture[] = [];
  router: Router;
  middleware: {
    native: Middleware[];
    pre: Middleware[];
    post: Middleware[];
  };

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
      ctx.response.body = await handler(ctx);
    });

    return this;
  }

  branch(path: string): Aperture {
    const aperture = new Aperture(this.path.join(path));

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

// import { Router, RouterContext } from "oak";
// import { ApertureOptions, Handler } from "./types.ts";
// import { normalize, joinPaths } from "./path.ts";

// export class Aperture {
//   basePath: string;
//   router: Router;
//   children: Map<string, Aperture>;
//   parent: Aperture | null;
//   middleware: {
//     native: any[];
//     pre: any[];
//     post: any[];
//   };

//   constructor(options: ApertureOptions = {}) {
//     this.basePath = options.basePath || "";
//     this.router = new Router();
//     this.children = new Map();
//     this.parent = null;
//     this.middleware = {
//       native: [],
//       pre: [],
//       post: []
//     };
//   }

//   use(middleware: any): Aperture {
//     this.middleware.native.push(middleware);
//     this.router.use(middleware);
//     return this;
//   }

//   pre(middleware: any): Aperture {
//     this.middleware.pre.push(middleware);
//     return this;
//   }

//   post(middleware: any): Aperture {
//     this.middleware.post.push(middleware);
//     return this;
//   }

//   open(path: string, handler: Handler): Aperture {
//     const normalizedPath = normalize(path);

//     this.router.all(normalizedPath, async (ctx: RouterContext) => {
//       // Handle pre-middleware if any
//       for (const mw of this.middleware.pre) {
//         await mw(ctx, async () => {});
//       }

//       // Get body based on request method
//       let body = {};
//       if (ctx.request.method === "GET") {
//         const params = {};
//         for (const [key, value] of ctx.request.url.searchParams.entries()) {
//           params[key] = value;
//         }
//         body = params;
//       } else if (ctx.request.hasBody) {
//         try {
//           body = await ctx.request.body({ type: "json" }).value;
//         } catch (e) {
//           console.error("Body parse error:", e);
//         }
//       }

//       // Execute handler
//       try {
//         const result = await handler(body, ctx);

//         // Handle post-middleware if any
//         for (const mw of this.middleware.post) {
//           await mw(ctx, async () => {});
//         }

//         ctx.response.body = { data: result };
//       } catch (error: any) {
//         ctx.response.status = error.status || 500;
//         ctx.response.body = {
//           error: {
//             message: error.message || "Internal Server Error"
//           }
//         };
//       }
//     });

//     return this;
//   }

//   nest(path: string, aperture: Aperture): Aperture {
//     const normalizedPath = normalize(path);
//     aperture.parent = this;
//     aperture.basePath = joinPaths(this.basePath, normalizedPath);
//     this.children.set(normalizedPath, aperture);

//     // Use the nested router at the given path
//     this.router.use(
//       normalizedPath,
//       aperture.router.routes(),
//       aperture.router.allowedMethods()
//     );

//     return this;
//   }

//   branch(path: string): Aperture {
//     const normalizedPath = normalize(path);
//     const branch = new Aperture({
//       basePath: joinPaths(this.basePath, normalizedPath)
//     });

//     this.nest(normalizedPath, branch);
//     return branch;
//   }

//   routes() {
//     return this.router.routes();
//   }

//   allowedMethods() {
//     return this.router.allowedMethods();
//   }

//   async serve({ port = 3000 } = {}) {
//     const { Application } = await import("oak");
//     const app = new Application();

//     app.use(this.router.routes());
//     app.use(this.router.allowedMethods());

//     const server = await app.listen({ port });
//     console.log(`Aperture server running on port ${port}`);

//     return { server, port, app };
//   }
// }

// export default {
//   create: (options = {}) => new Aperture(options)
// };
