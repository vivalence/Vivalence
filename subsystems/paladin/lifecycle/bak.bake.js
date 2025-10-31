import { Cake, Path, not, cast, is } from "@vivalence/typology";

// mode constraints apply!
export default function bake(paladin) {
  paladin.bake = {};

  paladin.bake.service = (servicecake) => {
    // move back to lifecycle.
    if (!servicecake.mount)
      servicecake.mount = paladin.join.mountpoint.service(servicecake.slug);
    return servicecake;
  };

  paladin.bake.runtime = (runtimecake) => {
    // TODO: move large parts back to lifecycle.

    runtimecake.mount = paladin.join.mountpoint.runtime(runtimecake.slug);

    if (!runtimecake.lighthouse) {
      let lighthouseservicecake =
        runtimecake.services?.find((s) => s.slug === "lighthouse") ||
        paladin.services.find((s) => s.slug === "lighthouse");
      if (lighthouseservicecake) {
        runtimecake.lighthouse = new Cake({
          ...lighthouseservicecake,
          runtime: runtimecake.slug,
          mount: paladin.join.mountpoint.service(
            "lighthouse",
            runtimecake.slug,
          ),
        });
      }
    }
    if (!runtimecake.datamap) {
      let datamapservicecake =
        runtimecake.services?.find((s) => s.slug === "datamap") ||
        paladin.services.find((s) => s.slug === "datamap");

      if (datamapservicecake) {
        runtimecake.datamap = new Cake({
          ...datamapservicecake,
          runtime: runtimecake.slug,
          mount: paladin.join.mountpoint.service("datamap", runtimecake.slug),
        });
      }
    }

    if (runtimecake.services) {
      runtimecake.services = runtimecake.services.map((serviceprocesscake) => {
        let servicecake = null;

        const remote = is.object(serviceprocesscake.service)
          ? serviceprocesscake.service
          : paladin.services.find(
              (service) =>
                service.slug === serviceprocesscake.service ||
                service.slug === serviceprocesscake.slug,
            );

        if (remote) {
          servicecake = new Cake({
            module: remote.module,
            manifest: {
              ...remote.manifest,
              ...serviceprocesscake.manifest,
              slug: serviceprocesscake.slug || remote.slug,
            },
            secrets: {
              ...(remote.secrets || {}),
              ...(serviceprocesscake.secrets || {}),
            },
            statics: {
              ...(remote.statics || {}),
              ...(serviceprocesscake.statics || {}),
            },
          });
        }

        if (!servicecake) {
          servicecake = new Cake(serviceprocesscake);
        }

        servicecake.runtime = runtimecake.slug;
        servicecake.mount = paladin.join.mountpoint //
          .service(servicecake.slug, servicecake.runtime);

        return servicecake;
      });
    }

    return runtimecake;
  };

  // paladin.bake.env = (processcake) => ({});

  // paladin.bake.process = (cake) => {
  //   if (is.string(cake.cmd)) cake.cmd = cake.cmd.split(" ");
  //   if (!is.array(cake.cmd)) throw not.cake(cake);
  //   // if (is.object(cake.))

  //   const command = {
  //     args: cmd.slice(1),
  //     env: {
  //       ...(cake.env || {}),
  //       VIVA_PROCESS_SLUG: cake.manifest.slug,
  //       VIVA_PROCESS_TYPE: cake.manifest.type,
  //     },
  //     stdout: cake?.detached ? "piped" : "inherit",
  //     stderr: cake?.detached ? "piped" : "inherit",
  //   };

  //   if (cake.cwd) command.cwd = cake.cwd;

  //   return cake;

  //   // const good = new Deno.Command(cmd[0], command).spawn();

  //   // const processdie = {
  //   //   slug: cake.manifest.slug,
  //   //   cake,
  //   //   good,
  //   //   // status connection
  //   // };

  //   // // good.status.then(() => children.delete(pce));
  //   // processdie.kill = async (signal = "SIGTERM") => {
  //   //   // try {processdie.good?.kill(signal); await processdie.good.status;} catch {child.instance.kill("SIGKILL");}
  //   // };

  //   // return processdie;
  // };

  // paladin.bake.compose = (composecake) => ({});

  // paladin.bake.docker = (dockercake) => ({});
}
