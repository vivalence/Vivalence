import { v } from "@vivalence/typology";
import { config } from "../belt/index.js";
import { ledger } from "./ledger/index.js";
import { registry } from "./registry/index.js";
import * as instance from "./instance/index.js";
import { instances } from "./instances/index.js";
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
  trajectory.branch("/instances").slurp(instances);

  trajectory.open(
    {
      nature: "/instance/create",
      valence:
        "create an instance from a source — a bare slug resolves against the registry, an ambiguous or missing one opens the picker; no target lands it in <ledger>/instances/<slug>",
      schema: v.object({
        source: v.string().desc("slug | @owner/instance/slug | ../path — preset for the picker").optional(),
        target: v.string().desc("destination dir (defaults to <ledger>/instances/<slug>)").optional(),
        use: v.boolean().desc("select it for this shell once created, and record it on the shelf").optional(),
        init: v.boolean().desc("run instance/init on it once created — seed .env, then the wizard (or headless report)").optional(),
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
      valence: "run the mounted instance attached (foreground) — exit 1 iff a child exits non-zero; --logged sends their output to <ledger>/logs/<slug>/",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
        logged: v.boolean().desc("write child output to the ledger's logs instead of the terminal").optional(),
      }),
    },
    instance.run,
  );

  trajectory.open(
    {
      nature: "/instance/start",
      valence: "start the mounted instance detached — a supervisor ghost runs it logged (instance/run --logged) and holds the lock",
      schema: v.object({
        process: v.string().desc("runtime | kajuit | all").optional(),
      }),
    },
    instance.start,
  );

  trajectory.open(
    {
      nature: "/instance/stop",
      valence: "stop the mounted instance — SIGTERM its supervisor, wait for the lock to clear",
      schema: v.object({}),
    },
    instance.stop,
  );

  trajectory.open(
    {
      nature: "/instance/delete",
      valence:
        "remove an instance from this machine — record, dead locks, logs, the sessions that selected it, and the dir when it lives on the shelf (a tapped dir stays); refuses while running; asks unless --force",
      schema: v.object({
        target: v.string().desc("slug or path (defaults to the mounted instance)").optional(),
        force: v.boolean().desc("skip the confirmation").optional(),
      }),
    },
    instance.delete,
  );

  trajectory.open(
    {
      nature: "/instance/lighthouse",
      valence: "signup or login against the mounted instance's lighthouse",
      schema: v.object({
        action: v.string().desc("signup | login").optional(),
        username: v.string().optional(),
        password: v.string().optional(),
      }),
    },
    instance.lighthouse,
  );

  trajectory.open(
    {
      nature: "/instance/doctor",
      valence: "instance report card — manifest, services, locks",
      schema: v.object({
        target: v.string().desc("slug or path (defaults to the mounted instance)").optional(),
        filter: v
          .string()
          .desc("narrow the env table — a substring, or a facet: group:keys · verdict:REQUIRED · key:NLP")
          .optional(),
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
