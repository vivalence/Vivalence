import { v } from "@vivalence/typology";
import { config } from "../belt/index.js";
import { ledger } from "./ledger/index.js";
import { registry } from "./registry/index.js";
import * as instance from "./instance/index.js";
import { instances } from "./instances/index.js";
import { census, flagged } from "./help.js";
import { Help } from "./Help.jsx";

export const flags = v.object({
  json: v.boolean().desc("the effect as json on stdout").optional(),
  buffer: v.boolean().desc("render the effect through the buffer view").optional(),
  help: v.boolean().desc("the nature's params and valence instead of running it").optional(),
  verbose: v.boolean().desc("the stack behind a failure, not just its one line").optional(),
  env: v.string().desc("<path>").examples("./environment/.env").optional(),
});

export default function (trajectory) {
  trajectory.branch("/ledger").slurp(ledger);
  trajectory.branch("/registry").slurp(registry);
  trajectory.branch("/instances").slurp(instances);

  trajectory.open(
    {
      nature: "/instance/use",
      valence:
        "select this shell's instance (VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an ambiguous or missing one opens the picker; bare use in a pipe prints current + provenance; trailing segments chain under /instance (instance/use italian run)",
      schema: v.object({
        reference: v.string().desc("slug | /abs | source path — preset for the picker").optional(),
        ledger: v.boolean().desc("write the machine default (<ledger>/.env) instead of this shell's session").group("flags").optional(),
      }),
    },
    instance.use,
  );

  trajectory.open(
    {
      nature: "/instance/create",
      valence:
        "create an instance from a source — a bare slug resolves against the registry, an ambiguous or missing one opens the picker; no target lands it in <ledger>/instances/<slug>",
      schema: v.object({
        source: v.string().desc("slug | @owner/instance/slug | ../path — preset for the picker").optional(),
        target: v.string().desc("destination dir (defaults to <ledger>/instances/<slug>)").optional(),
        use: v.boolean().desc("select it for this shell once created, and record it on the shelf").group("flags").optional(),
        init: v.boolean().desc("run instance/init on it once created — seed .env, then the wizard (or headless report)").group("flags").optional(),
        slug: v.string().desc("<slug>").examples("readmen").group("flags").optional(),
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
        logged: v.boolean().desc("write child output to the ledger's logs instead of the terminal").group("flags").optional(),
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
        force: v.boolean().desc("skip the confirmation").group("flags").optional(),
      }),
    },
    instance.delete,
  );

  trajectory.open(
    {
      nature: "/instance/rename",
      valence:
        "rename an instance — record key, logs, the sessions that selected it, and the dir when it lives on the shelf (a tapped dir stays); refuses while running",
      schema: v.object({
        target: v.string().desc("slug or path (defaults to the mounted instance)").optional(),
        next: v.string().desc("new slug"),
      }),
    },
    instance.rename,
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
      const shell = [...flagged(flags), ...Object.entries(config.mounts).map(([name, held]) => `--${name}=${held.shape}`)];
      ctx.effect = { commands, flags: shell };
      await ctx.view?.scroll.emit({ commands, flags: shell }, null, Help);
    },
  );
}
