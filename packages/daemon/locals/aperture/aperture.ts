import { Router, RouterContext } from "oak";
import { ApertureOptions, Handler } from "./types.ts";
import { normalize, joinPaths } from "./path.ts";

export class Aperture {
  basePath: string;
  router: Router;
  children: Map<string, Aperture>;
  parent: Aperture | null;
  middleware: {
    native: any[];
    pre: any[];
    post: any[];
  };

  constructor(options: ApertureOptions = {}) {
    this.basePath = options.basePath || "";
    this.router = new Router();
    this.children = new Map();
    this.parent = null;
    this.middleware = {
      native: [],
      pre: [],
      post: []
    };
  }

  use(middleware: any): Aperture {
    this.middleware.native.push(middleware);
    this.router.use(middleware);
    return this;
  }

  pre(middleware: any): Aperture {
    this.middleware.pre.push(middleware);
    return this;
  }

  post(middleware: any): Aperture {
    this.middleware.post.push(middleware);
    return this;
  }

  open(path: string, handler: Handler): Aperture {
    const normalizedPath = normalize(path);
    
    this.router.all(normalizedPath, async (ctx: RouterContext) => {
      // Handle pre-middleware if any
      for (const mw of this.middleware.pre) {
        await mw(ctx, async () => {});
      }
      
      // Get body based on request method
      let body = {};
      if (ctx.request.method === "GET") {
        const params = {};
        for (const [key, value] of ctx.request.url.searchParams.entries()) {
          params[key] = value;
        }
        body = params;
      } else if (ctx.request.hasBody) {
        try {
          body = await ctx.request.body({ type: "json" }).value;
        } catch (e) {
          console.error("Body parse error:", e);
        }
      }
      
      // Execute handler
      try {
        const result = await handler(body, ctx);
        
        // Handle post-middleware if any
        for (const mw of this.middleware.post) {
          await mw(ctx, async () => {});
        }
        
        ctx.response.body = { data: result };
      } catch (error: any) {
        ctx.response.status = error.status || 500;
        ctx.response.body = { 
          error: {
            message: error.message || "Internal Server Error"
          }
        };
      }
    });
    
    return this;
  }

  nest(path: string, aperture: Aperture): Aperture {
    const normalizedPath = normalize(path);
    aperture.parent = this;
    aperture.basePath = joinPaths(this.basePath, normalizedPath);
    this.children.set(normalizedPath, aperture);
    
    // Use the nested router at the given path
    this.router.use(
      normalizedPath, 
      aperture.router.routes(), 
      aperture.router.allowedMethods()
    );
    
    return this;
  }

  branch(path: string): Aperture {
    const normalizedPath = normalize(path);
    const branch = new Aperture({
      basePath: joinPaths(this.basePath, normalizedPath)
    });
    
    this.nest(normalizedPath, branch);
    return branch;
  }

  routes() {
    return this.router.routes();
  }

  allowedMethods() {
    return this.router.allowedMethods();
  }

  async serve({ port = 3000 } = {}) {
    const { Application } = await import("oak");
    const app = new Application();
    
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
    
    const server = await app.listen({ port });
    console.log(`Aperture server running on port ${port}`);
    
    return { server, port, app };
  }
}

export default {
  create: (options = {}) => new Aperture(options)
};
