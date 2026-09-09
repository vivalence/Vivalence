import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";
import { tap } from "./tap.js";

// PLURAL — verbs here work on the SET. `instance/*` acts on the one you selected;
// `instances/*` answers about all of them.
export const instances = new Vector();

instances.open(
  {
    nature: "/tap",
    valence:
      "adopt a hand-placed instance dir into the record — the record is the identity authority; --slug=<slug> required, the path is a PATH (./name, never a bare slug)",
    schema: v.object({
      path: v.string().desc("dir holding the instance"),
      slug: v.string().desc("<slug>").examples("readmen").group("flags"),
    }),
  },
  tap,
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
        running: (await paladin.ledger.lock(entry.slug).read())?.processes.map((held) => held.process).join(" ") ?? null,
        mount: entry.mount,
        valence: entry.valence ?? null,
      })),
    );
    ctx.effect = { instances: rows };
  },
);
