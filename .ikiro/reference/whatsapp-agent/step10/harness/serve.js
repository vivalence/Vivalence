import { serveDir } from "jsr:@std/http/file-server";
Deno.serve({ port: 0, hostname: "127.0.0.1", onListen: ({ port }) => console.log(`listen ${port}`) }, (request) =>
  serveDir(request, { fsRoot: new URL("..", import.meta.url).pathname, quiet: true }));
