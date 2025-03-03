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
