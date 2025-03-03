import { Application } from "oak";
import { Aperture } from "./aperture.ts";
import { Handler } from "./types.ts";

export { Aperture, Handler };

export default {
  init: (daemon) => {
    const options = {};
    daemon.aperture = new Aperture(options);
    // load some root level middlewares.
    // including the ctx creation for the daemon-level routes
    // high-sec shit.
    return daemon;
  },
  serve: (daemon: any) => {
    const server = new Server();

    await daemon.aperture.serve(server);

    daemon.server = server.listen({ port: 8080 });

    return daemon;
  },
};
