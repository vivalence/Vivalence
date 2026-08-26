import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { use } from "./use.js";
import { tap } from "./tap.js";
import { rename } from "./rename.js";

// PLURAL — verbs here work on the SET. `instance/*` acts on the one you selected;
// `instances/*` answers about all of them.
export const instances = new Vector();

instances.open(
  {
    nature: "/use",
    valence:
      "select this shell's instance from the set (VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an ambiguous or missing one opens the picker; --ledger writes the machine default; bare use in a pipe prints current + provenance; trailing segments chain under /instance (instances/use italian run)",
    schema: v.object({ reference: v.string().desc("slug | /abs | source path — preset for the picker").optional() }),
  },
  use,
);

instances.open(
  {
    nature: "/tap",
    valence:
      "adopt a hand-placed instance dir into the record — the record is the identity authority; --slug=<slug> required, the path is a PATH (./name, never a bare slug)",
    schema: v.object({ path: v.string().desc("dir holding the instance") }),
  },
  tap,
);

instances.open(
  {
    nature: "/rename",
    valence: "move an instance's record key — carries dead locks and the log dir; refuses while running",
    schema: v.object({
      prior: v.string().desc("current slug"),
      next: v.string().desc("new slug"),
    }),
  },
  rename,
);

instances.open(
  {
    nature: "/list",
    valence: "every instance on the shelf — slug, mount, valence, and which are running",
    schema: v.object({}),
  },
  async (ctx) => {
    const held = await paladin.ledger.instances.list();
    const selected = paladin.env.get("VIVA_INSTANCE_MOUNT");
    const rows = await Promise.all(
      held.map(async (entry) => ({
        slug: `${entry.mount === selected ? "*" : " "} ${entry.slug}`,
        running: (await paladin.ledger.locks(entry.slug)).map((lock) => lock.process).join(" ") || null,
        mount: entry.mount,
        valence: entry.valence ?? null,
      })),
    );
    ctx.effect = { instances: rows };
  },
);
