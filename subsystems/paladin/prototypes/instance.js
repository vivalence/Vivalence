import { isAbsolute, resolve as resolvePath } from "@std/path";
import { Pipe, Mask, v, fn } from "@vivalence/typology";

const reference = (home) => (entry) =>
  typeof entry !== "string"
    ? { ...entry, mount: entry.mount ?? home }
    : isAbsolute(entry)
      ? entry
      : /^\.\.?\//.test(entry)
        ? resolvePath(home.dirname, entry)
        : entry;

const hydrate = (node) =>
  typeof node === "function"
    ? node()
    : Array.isArray(node)
      ? node.map(hydrate)
      : node?.constructor === Object
        ? Object.fromEntries(Object.entries(node).map(([key, value]) => [key, hydrate(value)]))
        : node;

// move to lifecycle / dossier / die
async function resolve(instance) {
  if (!instance.paladin.scope.instance) throw new Error("instance.mount: no scope.instance");
  await instance.paladin.state.dir(instance.paladin.scope.instance.absolute);

  const modules = await instance.paladin.find.type(instance.paladin.scope.instance, "instance");
  if (modules.length !== 1)
    throw new Error(`instance.mount: expected 1 instance module, found ${modules.length}`);

  const mask = (kind) => (declaration) =>
    new Mask({
      ...declaration,
      mount: instance.paladin.scope.mountpoint.branch(
        `/${kind}_${declaration.slug ?? declaration.manifest?.slug}`,
      ),
    });

  const [module] = modules;

  const materialize = (declaration) => {
    const { kernel = [], ...rest } = declaration;
    return { ...hydrate(rest), kernel: kernel.map(reference(module.source)) };
  };

  instance.manifest = module.manifest;
  instance.runtime = hydrate(module.runtime ?? {});
  instance.clients = hydrate(module.clients ?? {});
  instance.lighthouse = hydrate(module.lighthouse ?? {});
  instance.daemons = (module.daemons ?? []).map((declaration) => mask("daemon")(materialize(declaration)));
  instance.services = (module.services ?? []).map((declaration) => mask("service")(hydrate(declaration)));

  // instance.runtime.logs = new Pipe()
  // instance.clients.kajuit.logs = new Pipe()
}

// move to lifecycle / dossier / die
function validate(instance) {
  const errors = [];
  const collect = (label, value, schema) => {
    for (const error of schema.errors(value))
      errors.push(`${label}${error.instancePath || ""}: ${error.message}`);
  };
  if (Object.keys(instance.runtime).length) {
    v.primitives.instance.Runtime.cast(instance.runtime);
    collect("runtime", instance.runtime, v.primitives.instance.Runtime);
  }
  for (const [slug, client] of Object.entries(instance.clients)) {
    v.primitives.instance.Client.cast(client);
    collect(`client[${slug}]`, client, v.primitives.instance.Client);
  }
  for (const daemon of instance.daemons) {
    v.primitives.instance.Daemon.cast(daemon);
    collect(`daemon[${daemon.slug}]`, daemon, v.primitives.instance.Daemon);
  }
  for (const service of instance.services) {
    v.primitives.instance.Service.cast(service);
    collect(`service[${service.slug}]`, service, v.primitives.instance.Service);
  }
  if (errors.length) throw new Error(`[instance.mount validate]\n  ${errors.join("\n  ")}`);
}

// move to lifecycle / dossier / die
async function environment(instance) {
  if (!instance.paladin.scope.environment) return;
  await instance.paladin.state.dir(instance.paladin.scope.environment);
  const files = await instance.paladin.find.json(instance.paladin.scope.environment);
  await Promise.all(
    files.map((file) =>
      instance.paladin.read
        .json(file)
        .then((json) =>
          (file.absolute.includes("secret") ? instance.paladin.secret : instance.paladin.env).assign(
            json,
          ),
        ),
    ),
  );
}

export class Instance {
  manifest = {};
  runtime = {};
  clients = {};
  lighthouse = {};
  daemons = [];
  services = [];

  constructor(paladin) {
    this.mount = fn.once(this.mount.bind(this));
    this.paladin = paladin;
    // this.logs = new Pipe();
  }

  async mount() {
    await environment(this); // env/secret first — marker modules read them at import time
    await resolve(this);
    validate(this);
    this.paladin.publish();

    // await log(this);
    // return this.paladin.state.jsonl(this.path.branch("spans.jsonl"), span.json);
    // return this.paladin.state.file(this.path.branch(`${stream}.log`));
    // this.logs.tap((span) => Deno.writeTextFileSync(FILE, render(span) + "\n\n", { append: true })); // B

    return this;
  }
}
