import { v } from "@vivalence/typology";
import { config } from "../belt/index.js";
import { ledger } from "./ledger/index.js";
import { registry } from "./registry/index.js";
import * as instance from "./instance/index.js";
import { census } from "./help.js";
import { Help } from "./Help.jsx";

const FLAGS = [
  "--json",
  "--buffer",
  "--help",
  "--env=<path>",
  ...config.MOUNTS.map((mount) => `--${mount}=<path>`),
];

export default function (trajectory) {
  trajectory.branch("/ledger").slurp(ledger);
  trajectory.branch("/registry").slurp(registry);

  trajectory.open(
    {
      nature: "/instance/create",
      valence:
        "create an instance from a source — a bare slug resolves against the registry, an ambiguous or missing one opens the picker; no target lands it in <ledger>/instances/<slug>",
      schema: v.object({
        source: v.string().desc("slug | @owner/instance/slug | ../path — preset for the picker").optional(),
        target: v.string().desc("destination dir (defaults to <ledger>/instances/<slug>)").optional(),
      }),
    },
    instance.create,
  );

  trajectory.open(
    {
      nature: "/instance/use",
      valence:
        "select this shell's instance (VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an ambiguous or missing one opens the picker; --ledger writes the machine default; bare use in a pipe prints current + provenance; trailing segments chain under /instance (use italian run)",
      schema: v.object({ reference: v.string().desc("slug | /abs | source path — preset for the picker").optional() }),
    },
    instance.use,
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

  trajectory.open(
    {
      nature: "/help",
      valence: "every nature with its params and valence; a prefix narrows, an exact nature details",
      schema: v.object({ filter: v.string().desc("noun or path prefix").optional() }),
    },
    async (ctx) => {
      const filter = ctx.signal.params?.[0];
      const commands = census(trajectory).filter(
        (row) => !filter || row.nature.startsWith(filter),
      );
      ctx.effect = { commands, flags: FLAGS };
      await ctx.view?.scroll.emit({ commands, flags: FLAGS }, null, Help);
    },
  );
}
