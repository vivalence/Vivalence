import { v } from "@vivalence/typology";
import { ledger } from "./ledger/index.js";
import * as instance from "./instance/index.js";

export default function (trajectory) {
  trajectory.branch("/ledger").slurp(ledger);

  trajectory.open(
    {
      nature: "/instance/create",
      valence: "create an instance from a source — no target lands it in <ledger>/instances/<slug>",
      schema: v.object({
        source: v.string().desc("@owner/instance/slug identifier or ../path").optional(),
        target: v.string().desc("destination dir (defaults to <ledger>/instances/<slug>)").optional(),
      }),
    },
    instance.create,
  );

  trajectory.open(
    {
      nature: "/instance/init",
      valence: "instance first-run — seed .env; then the wizard (or <user> <pass>) boots, signs up the admin, tears down",
      schema: v.object({
        username: v.string().optional(),
        password: v.string().optional(),
      }),
    },
    instance.init,
  );

  trajectory.open(
    {
      nature: "/instance/run",
      valence: "run the mounted instance attached (foreground)",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    instance.run,
  );

  trajectory.open(
    {
      nature: "/instance/start",
      valence: "start the mounted instance detached (background)",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    instance.start,
  );

  trajectory.open(
    {
      nature: "/instance/stop",
      valence: "stop the mounted instance",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    instance.stop,
  );

  trajectory.open(
    {
      nature: "/instance/auth",
      valence: "signup or login against the mounted instance's lighthouse",
      schema: v.object({
        action: v.string().desc("signup | login").optional(),
        username: v.string().optional(),
        password: v.string().optional(),
      }),
    },
    instance.auth,
  );

  trajectory.open(
    {
      nature: "/instance/doctor",
      valence: "instance report card — manifest, services, locks",
      schema: v.object({
        target: v.string().desc("slug or path (defaults to the mounted instance)").optional(),
      }),
    },
    instance.doctor,
  );
}
