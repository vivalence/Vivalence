import "./config.js";
import runtimes from "./runtimes/index.js";
import server from "./server/index.js";
import locals from "./locals.js";
import serve from "./server/serve.js";

console.log("Daemon starting...");

function daemonize({ server }) {
  return new Promise((resolve) => {
    const shutdown = () => {
      console.log("Shutting down server...");
      server.close();
      resolve();
    };

    Deno.addSignalListener("SIGINT", () => {
      console.log("Server interrupted");
      shutdown();
    });

    Deno.addSignalListener("SIGINT", () => {
      console.log("Received SIGINT. Initiating shutdown...");
      shutdown();
    });
  });
}

await [
  locals,
  server,
  runtimes,
  serve,
  daemonize,
].reduce((acc, fn) => acc.then(fn), Promise.resolve());

console.log("Daemon has shut down");

// async function cleanup() {const port = Deno.env.get("DAEMON_SERVER_PORT"); const p = Deno.run({cmd: ["lsof", "-i", `:${port}`, "-t"], stdout: "piped", stderr: "piped",}); const output = await p.output(); const errors = await p.stderrOutput(); p.close(); if (errors.length > 0) {console.error(new TextDecoder().decode(errors)); return;} const pids = new TextDecoder().decode(output).trim().split("\n").filter(Boolean); for (const pid of pids) {console.log(`Killing process ${pid} on port ${port}`); const kill = Deno.run({cmd: ["kill", "-9", pid],}); await kill.status(); kill.close();}}

// Array.from({ length: 3 }).map(() => console.log("[[[[[-------------<<<<>>>>------------]]]]]"));
