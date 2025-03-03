#!/bin/bash

# Setup simplified Aperture project
echo "Setting up streamlined Aperture project..."

# Create project directory
mkdir -p aperture

# Create types.ts - minimal types that extend Oak
cat > aperture/types.ts << 'EOF'
import { Context as OakContext, RouterContext } from "oak";

export type Handler = <T extends RouterContext>(
  body: any,
  ctx: T
) => Promise<any> | any;

export interface ApertureOptions {
  basePath?: string;
}
EOF

# Create path.ts - only essential path utilities
cat > aperture/path.ts << 'EOF'
export function normalize(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  return path.endsWith("/") && path.length > 1 
    ? path.slice(0, -1) 
    : path;
}

export function joinPaths(base: string, path: string): string {
  if (!base) return path;
  if (!path) return base;
  
  return `${base.endsWith("/") ? base.slice(0, -1) : base}${
    path.startsWith("/") ? path : "/" + path
  }`;
}
EOF

# Create aperture.ts - streamlined integration with Oak
cat > aperture/aperture.ts << 'EOF'
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
EOF

# Create index.ts - simplified exports
cat > aperture/index.ts << 'EOF'
import { Aperture } from "./aperture.ts";
import { Handler } from "./types.ts";

export { Aperture, Handler };

export default {
  create: (options = {}) => new Aperture(options)
};
EOF

# Create example.ts - simplified usage
cat > aperture/example.ts << 'EOF'
import Aperture from "./index.ts";

const auth = async (ctx, next) => {
  const token = ctx.request.headers.get("Authorization");
  if (token) {
    ctx.state.user = { id: 1, role: "admin" };
  }
  await next();
};

const logRequest = async (ctx, next) => {
  const start = Date.now();
  console.log(`→ ${ctx.request.method} ${ctx.request.url.pathname}`);
  await next();
  console.log(`← ${ctx.response.status} ${Date.now() - start}ms`);
};

async function main() {
  const daemon = {};
  
  daemon.aperture = Aperture.create();
  daemon.aperture.use(logRequest);
  
  daemon.aperture.open("/status", () => ({ 
    status: "ok", 
    time: new Date() 
  }));
  
  daemon.runtime = {};
  daemon.runtime.aperture = daemon.aperture.branch("/runtime");
  daemon.runtime.aperture.use(auth);
  
  daemon.runtime.aperture.open("/config", (_, ctx) => {
    if (!ctx.state.user) {
      ctx.response.status = 401;
      return { error: "Unauthorized" };
    }
    return { env: "production", debug: false };
  });
  
  // Create API branch
  const api = daemon.aperture.branch("/api");
  api.open("/users/:id", (_, ctx) => ({ 
    user: { id: ctx.params.id } 
  }));
  
  // Start server
  const { port } = await daemon.aperture.serve({ port: 3000 });
  console.log(`Daemon running at http://localhost:${port}`);
  
  return daemon;
}

if (import.meta.main) {
  main().catch(console.error);
}

export default main;
EOF

# Create deno.json for Deno compatibility
cat > aperture/deno.json << 'EOF'
{
  "imports": {
    "oak": "https://deno.land/x/oak@v12.6.1/mod.ts"
  }
}
EOF

echo "Streamlined Aperture project setup complete!"
echo "To run the project with Deno:"
echo "  cd aperture"
echo "  deno run --allow-net example.ts"

