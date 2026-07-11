import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { Path } from "@vivalence/typology";

export async function install(ctx) {
  const target = ctx.signal.params?.[0];
  if (target) {
    const cwd = Deno.env.get("INIT_CWD") ?? Deno.env.get("PWD") ?? Deno.cwd();
    const root = new Path(resolve(cwd, target));
    paladin.scopes([["ledger", () => true, () => root]]);
    paladin.ledger.registry.path = paladin.scope.ledger.branch("registry.json");
    paladin.ledger.instances.path = paladin.scope.ledger.branch("instances.json");
  }

  for (const sub of ["locks", "logs"]) {
    await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });
  }

  const registry = await paladin.ledger.registry.seed(paladin.scope.registry);

  const instances = paladin.scope.ledger.branch("instances.json");
  if (!(await paladin.read.json(instances, null))) await paladin.state.json(instances, {});

  ctx.effect = { ledger: paladin.scope.ledger.absolute, scaffolded: ["locks", "logs"], registry };
}
