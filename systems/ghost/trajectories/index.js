import { v } from "@vivalence/typology";
import { ledger } from "./ledger/index.js";
import * as variant from "./variant/index.js";

export default function (trajectory) {
  trajectory.branch("/ledger").slurp(ledger);

  trajectory.open(
    {
      nature: "/variant/create",
      valence: "create a variant from a source — no target lands it in <ledger>/variants/<slug>",
      schema: v.object({
        source: v.string().desc("@owner/variant/slug identifier or ../path").optional(),
        target: v.string().desc("destination dir (defaults to <ledger>/variants/<slug>)").optional(),
      }),
    },
    variant.create,
  );

  trajectory.open(
    {
      nature: "/variant/init",
      valence: "variant first-run — seed .env; then the wizard (or <user> <pass>) boots, signs up the admin, tears down",
      schema: v.object({
        username: v.string().optional(),
        password: v.string().optional(),
      }),
    },
    variant.init,
  );

  trajectory.open(
    {
      nature: "/variant/run",
      valence: "run the mounted variant attached (foreground)",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    variant.run,
  );

  trajectory.open(
    {
      nature: "/variant/start",
      valence: "start the mounted variant detached (background)",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    variant.start,
  );

  trajectory.open(
    {
      nature: "/variant/stop",
      valence: "stop the mounted variant",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    variant.stop,
  );

  trajectory.open(
    {
      nature: "/variant/auth",
      valence: "signup or login against the mounted variant's lighthouse",
      schema: v.object({
        action: v.string().desc("signup | login").optional(),
        username: v.string().optional(),
        password: v.string().optional(),
      }),
    },
    variant.auth,
  );

  trajectory.open(
    {
      nature: "/variant/doctor",
      valence: "variant report card — manifest, services, locks",
      schema: v.object({
        target: v.string().desc("slug or path (defaults to the mounted variant)").optional(),
      }),
    },
    variant.doctor,
  );
}
