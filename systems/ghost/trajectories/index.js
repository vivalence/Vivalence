import { v } from "@vivalence/typology";
import * as instance from "./instance/index.js";
import * as system from "./system/index.js";
// import * as sheets from "./sheets/index.js";

export default function (trajectory) {
  trajectory.open(
    {
      nature: "/instance/clone",
      valence: "clone a variant to a local target",
      schema: v.object({
        slug: v.string().desc("variant slug").optional(),
        target: v.string().desc("target path (defaults to ./<slug>)").optional(),
      }),
    },
    instance.clone,
  );

  trajectory.open(
    {
      nature: "/instance/doctor",
      valence: "instance report card — locks, processes, logs (seed)",
      schema: v.object({}),
    },
    instance.doctor,
  );

  trajectory.open(
    {
      nature: "/instance/init",
      valence: "boot a variant + signup admin + scaffold",
      schema: v.object({
        slug: v.string().desc("variant slug or path").optional(),
      }),
    },
    instance.init,
  );

  trajectory.open(
    {
      nature: "/instance/run",
      valence: "run a variant attached (foreground)",
      schema: v.object({
        slug: v.string().desc("variant slug or path").optional(),
      }),
    },
    instance.run,
  );

  trajectory.open(
    {
      nature: "/instance/start",
      valence: "start a variant detached (background)",
      schema: v.object({
        slug: v.string().desc("variant slug or path").optional(),
      }),
    },
    instance.start,
  );

  trajectory.open(
    {
      nature: "/instance/stop",
      valence: "stop a running variant",
      schema: v.object({
        slug: v.string().desc("variant slug or path").optional(),
      }),
    },
    instance.stop,
  );

  trajectory.open(
    {
      nature: "/system/doctor",
      valence: "system report card — scopes, processes, locks, registry",
      schema: v.object({}),
    },
    system.doctor,
  );

  trajectory.open(
    {
      nature: "/system/init",
      valence: "init $VIVA_SYSTEM_MOUNT + scaffold logs/locks + persist embedding",
      schema: v.object({}),
    },
    system.init,
  );
}
