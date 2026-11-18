import sys,re,os
R=sys.argv[1]
def sub(path, pairs):
    p=f"{R}/{path}"; s=open(p).read()
    for a,b in pairs:
        assert s.count(a)==1,(path,a[:60],s.count(a)); s=s.replace(a,b)
    open(p,"w").write(s)
L="subsystems/paladin/instance/lifecycle"
sub(f"{L}/2-resolution.js",[("const referencing = (declaration, daemon)",
'''export const named = (entry, index) => {
  const [type, slug] = identity(entry) ?? [];
  return type ? `.${type}.${slug}` : `[${index}]`;
};

const hosted = (declaration, index) => {
  const slug = declaration?.manifest?.slug;
  return slug ? `.${slug}` : `[${index}]`;
};

export const label = (instance, pointer) =>
  pointer
    .split("/")
    .slice(1)
    .reduce(
      ({ at, node, key }, part) => {
        const next = node?.[part];
        if (!/^\\d+$/.test(part)) return { at: at ? `${at}.${part}` : part, node: next, key: part };
        if (key === "modes") return { at: at + named(next, part), node: next, key };
        if ([instance.daemons, instance.services, instance.clients].includes(node))
          return { at: at + hosted(next, part), node: next, key };
        return { at: `${at}[${part}]`, node: next, key };
      },
      { at: "", node: instance, key: "" },
    ).at || "instance";

const referencing = (declaration, daemon)''')])
sub(f"{L}/3-integration.js",[
('import { extend } from "../../gestalten/belt/faculties.js";\n','import { extend } from "../../gestalten/belt/faculties.js";\nimport { label, named } from "./2-resolution.js";\n'),
('''const label = (instance, pointer) =>
  pointer
    .split("/")
    .slice(1)
    .reduce((at, part) => {
      const slot = { daemons: "daemon", services: "service", clients: "client" }[at];
      if (slot) return `${slot}[${instance[at][part]?.manifest?.slug}]`;
      return /^\\d+$/.test(part) ? `${at}[${part}]` : at ? `${at}.${part}` : part;
    }, "") || "instance";

''',''),
('composed(instance, `daemon[${daemon.manifest.slug}]`, daemon)','composed(instance, `daemons.${daemon.manifest.slug}`, daemon)'),
('misworn(`runtime.modes[${index}]`, mode, runtime)','misworn(`runtime.modes${named(mode, index)}`, mode, runtime)'),
('misworn(`service[${service.manifest.slug}]`, service, runtime)','misworn(`services.${service.manifest.slug}`, service, runtime)'),
('      const at = `daemon[${daemon.manifest.slug}]`;','      const at = `daemons.${daemon.manifest.slug}`;'),
('misworn(`${at}.modes[${index}]`, mode, daemon)','misworn(`${at}.modes${named(mode, index)}`, mode, daemon)'),
('awake(instance, `${at}.modes[${index}]`, mode.hallucinators)','awake(instance, `${at}.modes${named(mode, index)}`, mode.hallucinators)'),
('awake(instance, `service[${service.manifest?.slug}]`,','awake(instance, `services.${service.manifest?.slug}`,'),
('    const at = `daemon[${daemon.manifest?.slug}]`;','    const at = `daemons.${daemon.manifest?.slug}`;'),
('/^(?:daemon|service)\\[[^\\]]*\\]\\./','/^(?:daemons|services)\\.[^.]+\\./'),
])
sub(f"{L}/1-population.js",[
('import { inherit } from "./2-resolution.js";','import { inherit, label, named } from "./2-resolution.js";'),
('faults.map(({ at, reason }) => `${at} ${reason}`)','faults.map(({ at, reason }) => `${label(own, at)} ${reason}`)'),
('          ? dress(`${label}.modes[${index}]`)(at(`${label}.modes[${index}]`)(entry))','          ? dress(`${label}.modes${named(entry, index)}`)(at(`${label}.modes${named(entry, index)}`)(entry))'),
('dressed(`client[${slug(declaration)}]`)','dressed(`clients.${slug(declaration)}`)'),
('at(`service[${slug(declaration)}]`)','at(`services.${slug(declaration)}`)'),
('dressed(`daemon[${slug(declaration)}]`)','dressed(`daemons.${slug(declaration)}`)'),
])
sub("systems/runtime/subjects/runtime/lifecycle/1-population.js",[('at: `service[${citizen.manifest.slug}]`,','at: `services.${citizen.manifest.slug}`,')])
