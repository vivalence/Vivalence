export default function daemonize({ server, abortController }) {
  return new Promise((resolve, reject) => {
    const shutdown = () => {
      console.log("Shutting down server...");
      abortController.abort();
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
