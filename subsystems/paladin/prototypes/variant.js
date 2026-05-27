import { Pipe, Mask, v, fn } from "@vivalence/typology";

const hydrate = (node) =>
  typeof node === "function"
    ? node()
    : Array.isArray(node)
      ? node.map(hydrate)
      : node?.constructor === Object
        ? Object.fromEntries(Object.entries(node).map(([key, value]) => [key, hydrate(value)]))
        : node;

async function resolve(variant) {
  if (!variant.paladin.scope.variant) throw new Error("variant.mount: no scope.variant");
  await variant.paladin.state.dir(variant.paladin.scope.variant.absolute);

  const cakes = await variant.paladin.find.type(variant.paladin.scope.variant, "variant");
  if (cakes.length !== 1)
    throw new Error(`variant.mount: expected 1 variant cake, found ${cakes.length}`);

  const mask = (kind) => (declaration) =>
    new Mask({
      ...declaration,
      mount: variant.paladin.scope.mountpoint.branch(
        `/${kind}_${declaration.slug ?? declaration.manifest?.slug}`,
      ),
    });

  const [cake] = cakes;
  variant.manifest = cake.manifest;
  variant.runtime = hydrate(cake.runtime ?? {});
  variant.clients = hydrate(cake.clients ?? {});
  variant.daemons = [...(cake.daemons ?? []), ...(cake.circuitry?.daemons ?? [])].map(
    (declaration) => mask("daemon")(hydrate(declaration)),
  );
  variant.services = [...(cake.services ?? []), ...(cake.circuitry?.services ?? [])].map(
    (declaration) => mask("service")(hydrate(declaration)),
  );

  // variant.runtime.logs = new Pipe()
  // variant.clients.kajuit.logs = new Pipe()
}

function validate(variant) {
  const errors = [];
  const collect = (label, value, schema) => {
    for (const error of schema.errors(value))
      errors.push(`${label}${error.instancePath || ""}: ${error.message}`);
  };
  if (Object.keys(variant.runtime).length)
    collect("runtime", variant.runtime, v.primitives.variant.Runtime);
  for (const [slug, client] of Object.entries(variant.clients))
    collect(`client[${slug}]`, client, v.primitives.variant.Client);
  for (const daemon of variant.daemons)
    collect(`daemon[${daemon.slug}]`, daemon, v.primitives.circuitry.Daemon);
  for (const service of variant.services)
    collect(`service[${service.slug}]`, service, v.primitives.circuitry.Service);
  if (errors.length) throw new Error(`[variant.mount validate]\n  ${errors.join("\n  ")}`);
}

async function environment(variant) {
  if (!variant.paladin.scope.environment) return;
  await variant.paladin.state.dir(variant.paladin.scope.environment);
  const files = await variant.paladin.find.json(variant.paladin.scope.environment);
  await Promise.all(
    files.map((file) =>
      variant.paladin.read
        .json(file)
        .then((json) =>
          (file.absolute.includes("secret") ? variant.paladin.secret : variant.paladin.env).assign(
            json,
          ),
        ),
    ),
  );
}

export class Variant {
  manifest = {};
  runtime = {};
  clients = {};
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
