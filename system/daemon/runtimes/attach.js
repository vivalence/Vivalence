import config from "@vivalence/config";
import { is } from "@vivalence/shared";
import services from "../boot/services.js";
import { inject } from "./lib.js";

export default async function (daemon, runtime) {
  const attached = daemon.aperture
    .branch(`/attached`)
    .branch(`/runtime/${runtime.entity.slug}`)
    .use(inject(runtime));

  await services.attach(runtime.services, attached.branch(`/services`));
  attach(attached.branch("/views"));

  for (const modules of Object.values(runtime.modules)) {
    for (const module of Object.values(modules)) {
      if (module.manifest.traits?.includes("VIEWABLE")) {
        const base = config.env.get("VIVA_DAEMON_URL");
        const url = `${base}/attached/runtime/${runtime.manifest.slug}/views/${module.manifest.type}/${module.manifest.slug}/bundle/${module.view.bundle.entry}`;
        module.view.url = url;
      }
    }
  }
}

function attach(aperture) {
  aperture.branch("/:module/:slug").open("/bundle/(.*)", async (input, ctx) => {
    const module = ctx.runtime.modules[ctx.params.module][ctx.params.slug];
    const bundle = await module.view.bundle.serve(ctx.params["0"]);
    ctx.response.type = "application/javascript";
    return bundle;
  });
}
