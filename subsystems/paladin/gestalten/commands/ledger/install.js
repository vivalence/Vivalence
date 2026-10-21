import { isAbsolute, join, resolve } from "@std/path";
import * as dotenv from "@std/dotenv";
import { is, Path, v, Vector } from "@vivalence/typology";
import paladin from "../../../mod.js";
import { RECIPE } from "../../../ledger/prototype.js";
import { path } from "../belt/index.js";
import * as views from "../views/index.js";

const SCAFFOLD = ["locks", "logs", "registry", "instances", "sessions"];

const canonical = () => paladin.scope.repository.branch(`commons/ledger/${RECIPE}`);

async function shellConfig(key, value) {
  const dir = join(Deno.env.get("XDG_CONFIG_HOME") ?? join(Deno.env.get("HOME"), ".config"), "viva");
  const file = join(dir, "env");
  await Deno.mkdir(dir, { recursive: true });
  const held = await Deno.readTextFile(file).catch(() => "");
  const exported = `export ${key}="${value}"`;
  const pattern = new RegExp(`^[ \\t]*export[ \\t]+${key}[ \\t]*=.*$`, "m");
  const text = pattern.test(held) ? held.replace(pattern, () => exported) : `${held ? held.replace(/\n*$/, "\n") : ""}${exported}\n`;
  await Deno.writeTextFile(file, text);
  return file;
}

const EMBEDDINGS = {
  config: async (mount) => ({ mount, mode: "config", config: await shellConfig("VIVA_LEDGER_MOUNT", mount), persisted: true }),
  manual: (mount) => ({ mount, mode: "manual", exported: `export VIVA_LEDGER_MOUNT="${mount}"`, persisted: false }),
};

const WHERE = (home) => ({
  title: "ledger/install",
  pages: [{
    title: "where does $viva live?",
    fields: [
      {
        name: "how",
        label: "embedded by",
        kind: "select",
        initial: "config",
        options: [{ label: ".config", value: "config" }, { label: "manual export", value: "manual" }],
        hint: "how vivalence (viva) finds its ledger in a new shell",
      },
      { name: "mount", label: "$VIVA_LEDGER_MOUNT", kind: "text", initial: home },
    ],
  }],
  actions: ["install", "abort"],
});

async function choose(ctx) {
  const target = ctx.signal.body[0];
  const home = paladin.scope.ledger.absolute;
  if (target) return { mount: resolve(path.cwd(), target), persisted: false };
  if (!ctx.hold) return { mount: home, persisted: false };
  const answer = await ctx.hold(views.form, WHERE(home));
  if (answer.aborted) return { aborted: true };
  return await EMBEDDINGS[answer.values.how](answer.values.mount);
}

export const install = new Vector().open(
  {
    nature: "/ledger/install",
    valence: "machine first-run — pick + persist the ledger home, scaffold locks/logs/registry/instances. Example: viva ledger/install ~/.viva",
    input: v.object({ path: v.string().desc("the ledger home, skips the form. Example: ~/.viva").optional() }),
  },
  async (ctx) => {
    const choice = await choose(ctx);
    if (choice.aborted) return choice;

    const root = new Path(choice.mount);
    paladin.scopes([["ledger", () => true, () => root]]);
    Object.assign(paladin.ledger, { declaration: undefined, held: undefined });
    for (const sub of SCAFFOLD) await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });

    const recipe = paladin.scope.ledger.branch(RECIPE);
    if (!(await Deno.stat(recipe.absolute).catch(() => null))) await Deno.copyFile(canonical().absolute, recipe.absolute);
    const authored = Object.values(await paladin.read.json(recipe)).filter((value) => is.string(value) && !value.includes("${") && !isAbsolute(value));
    for (const part of authored) {
      const target = resolve(paladin.scope.ledger.absolute, part);
      const shipped = resolve(canonical().dirname, part);
      if (!(await Deno.stat(target).catch(() => null)) && (await Deno.stat(shipped).catch(() => null))) await Deno.copyFile(shipped, target);
    }
    const declaration = await paladin.ledger.recipe();
    for (const slot of ["instances", "registry"]) {
      const { path: record, held } = paladin.ledger.record(slot);
      if (!held && !(await Deno.stat(record.absolute).catch(() => null))) await paladin.state.json(record, {});
    }
    const commons = paladin.scope.repository.branch("commons").absolute;
    for (const found of await paladin.ledger.registry.discover(new Path(commons))) await paladin.ledger.registry.tap(found.root);
    const environment = declaration?.environment ?? v.environment({});

    const env = paladin.scope.ledger.branch(".env");
    const held = await paladin.read.text(env).catch(() => null);
    const missing = held === null
      ? Object.keys(environment.properties)
      : Object.keys(environment.properties).filter((key) => !new RegExp(`^#?\\s*${key}=`, "m").test(held));
    if (held === null) await paladin.state.text(env, paladin.envfile.scaffold(environment));
    else if (missing.length) {
      const subset = v.environment(Object.fromEntries(missing.map((key) => [key, environment.properties[key]])));
      await paladin.state.text(env, `${held.replace(/\n*$/, "\n")}\n${paladin.envfile.scaffold(subset)}`);
    }
    paladin.claim(await dotenv.load({ envPath: env.absolute }), "ledger", env.absolute);
    const seed = Object.entries(environment.properties).filter(([key]) => paladin.env.get(key) === null && paladin.secret.get(key) === null);

    return {
      ...choice,
      ledger: paladin.scope.ledger.absolute,
      scaffolded: SCAFFOLD,
      commons,
      recipe: recipe.absolute,
      env: env.absolute,
      authored: missing,
      fill: seed.map(([key]) => key),
    };
  },
);
