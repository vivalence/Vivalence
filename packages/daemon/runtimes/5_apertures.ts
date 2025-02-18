import { Daemon, Runtime } from "@vivalence/types";
import aperture from "../aperture/index.js";

export default async function apertures(daemon: Daemon) {
  for await (let [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      runtime.aperture = { router: daemon.aperture.router.create(), pathname: "/aperture" };
      runtime = await aperture.runtime(runtime);
      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime apertures error]", e);
    }
  }

  return daemon;
}
