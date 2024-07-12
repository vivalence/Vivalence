Array.from({ length: 3 }).map(() => console.log("[[[[[-------------<<<<>>>>------------]]]]]"));

import boot from "./viva/boot.js";
import server from "./server/index.js";
import serve from "./server/serve.js";

[
    boot,
    server,
    serve,
    ({ server }) =>
        new Promise((resolve) => {
            const shutdown = () => {
                console.log("Shutting down server...");
                server.close();
                resolve();
            };

            Deno.addSignalListener("SIGINT", () => {
                console.log("Received SIGINT. Initiating shutdown...");
                shutdown();
            });
        })
].reduce((acc, fn) => acc.then(fn), Promise.resolve());

console.log("Daemon has shut down");
