import { Path } from "@vivalence/typology";
// mabye this ought to function more like some sort of discovery guidance.
// maybe a register of some sort.

export default async function scopes(paladin) {
  paladin.scope = {
    get system() {
      return new Path(paladin.env.get("VIVA_SYSTEM_MOUNT"));
    },
    get tilde() {
      const env = paladin.env.get("VIVA_TILDE_MOUNT");
      const path = new Path(env);
      return path;
    },
    get registry() {
      // return new Path(paladin.env.get("VIVA_REGISTRY_MOUNT"));
      let envpath;
      if (Deno.env.has("VIVA_REGISTRY_MOUNT")) {
        envpath = Deno.env.get("VIVA_REGISTRY_MOUNT");
      } else envpath = paladin.scope.system.branch("registry").absolute;
      return new Path(envpath);
    },
    get circuits() {
      let envpath;
      if (Deno.env.has("VIVA_CIRCUITS_MOUNT")) {
        envpath = Deno.env.get("VIVA_CIRCUITS_MOUNT");
      } else envpath = paladin.scope.tilde.branch("circuits").absolute;
      return new Path(envpath);
    },
    get mountpoint() {
      let envpath;
      if (Deno.env.has("VIVA_MOUNTPOINT_MOUNT")) {
        envpath = Deno.env.get("VIVA_MOUNTPOINT_MOUNT");
      } else envpath = paladin.scope.tilde.branch("mountpoint").absolute;
      return new Path(envpath);
    },
    get environment() {
      let envpath;
      if (Deno.env.has("VIVA_ENVIRONMENT_MOUNT")) {
        envpath = Deno.env.get("VIVA_ENVIRONMENT_MOUNT");
      } else envpath = paladin.scope.tilde.branch("environment").absolute;
      return new Path(envpath);
    },
  };
}

// variant: new Path(paladin.env.get("VIVA_TILDE_MOUNT")).branch("variant"),
// importmap: await paladin.read.json(paladin.join.system("import_map.json")),
