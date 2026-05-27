import { Path } from "@vivalence/typology";

export default async function (paladin) {
  const scopes = new Map();
  // paladin._scopes = scopes;

  paladin.scopes = (declarations) => {
    declarations.forEach(([name, condition, resolver]) => {
      if (scopes.has(name)) console.warn("paladin.scope overwrite");
      scopes.set(name, [condition, resolver]);
    });
  };

  paladin.scope = new Proxy(
    {},
    {
      get: (_, key) => {
        const [condition, resolver] = scopes.get(key) ?? [];
        return condition?.() ? resolver?.() : undefined;
      },

      has: (_, key) => {
        const [condition] = scopes.get(key) ?? [];
        return condition?.() ?? false;
      },

      ownKeys: () => {
        return Array.from(scopes.keys()).filter((key) => {
          const [condition] = scopes.get(key) ?? [];
          return condition?.();
        });
      },
      getOwnPropertyDescriptor: (_, key) => {
        const [condition] = scopes.get(key) ?? [];
        if (condition?.()) {
          return { enumerable: true, configurable: true };
        }
      },
    },
  );
}

// variant: new Path(paladin.env.get("VIVA_VARIANT_MOUNT")).branch("variant"),
// const [control,proxy] = new Scope();
// importmap: await paladin.read.json(paladin.join.system("import_map.json")),

// return;
// paladin.scope = {
//   // legacy:
//   get circuits() {
//     return paladin.scope.circuitry;
//   },
//   get tilde() {
//     return paladin.scope.variant;
//   },
//   //
//   get system() {
//     return new Path(paladin.env.get("VIVA_REPOSITORY_MOUNT"));
//   },
//   get variant() {
//     const env = paladin.env.get("VIVA_VARIANT_MOUNT");
//     const path = new Path(env);
//     return path;
//   },
//   get registry() {
//     // return new Path(paladin.env.get("VIVA_REGISTRY_MOUNT"));
//     let envpath;
//     if (Deno.env.has("VIVA_REGISTRY_MOUNT")) {
//       envpath = Deno.env.get("VIVA_REGISTRY_MOUNT");
//     } else envpath = paladin.scope.system.branch("registry").absolute;
//     return new Path(envpath);
//   },
//   get circuitry() {
//     let envpath;
//     if (Deno.env.has("VIVA_CIRCUITRY_MOUNT")) {
//       envpath = Deno.env.get("VIVA_CIRCUITRY_MOUNT");
//     } else envpath = paladin.scope.variant.branch("circuitry").absolute;
//     return new Path(envpath);
//   },
//   get mountpoint() {
//     let envpath;
//     if (Deno.env.has("VIVA_MOUNTPOINT_MOUNT")) {
//       envpath = Deno.env.get("VIVA_MOUNTPOINT_MOUNT");
//     } else envpath = paladin.scope.variant.branch("mountpoint").absolute;
//     return new Path(envpath);
//   },
//   get environment() {
//     let envpath;
//     if (Deno.env.has("VIVA_ENVIRONMENT_MOUNT")) {
//       envpath = Deno.env.get("VIVA_ENVIRONMENT_MOUNT");
//     } else envpath = paladin.scope.variant.branch("environment").absolute;
//     return new Path(envpath);
//   },
// };
