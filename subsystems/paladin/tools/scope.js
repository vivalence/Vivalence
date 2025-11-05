// mabye this ought to function more like some sort of discovery guidance.
// maybe a register of some sort.

export default async function scopes(paladin) {
  paladin.scope = {
    get system() {
      return new Path(paladin.env.get("VIVA_SYSTEM_MOUNT"));
    },
    get tilde() {
      return new Path(paladin.env.get("VIVA_TILDE_MOUNT"));
    },
    get registry() {
      return new Path(paladin.env.get("VIVA_REGISTRY_MOUNT"));
    },
  };
}

// variant: new Path(paladin.env.get("VIVA_TILDE_MOUNT")).branch("variant"),
// importmap: await paladin.read.json(paladin.join.system("import_map.json")),
