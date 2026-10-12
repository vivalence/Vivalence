import paladin, { lifecycle } from "@vivalence/paladin";
import { RECIPE } from "@vivalence/paladin/typology";
import { isAbsolute, resolve } from "@std/path";
import * as dotenv from "@std/dotenv";
import { is, Path, v, Vector } from "@vivalence/typology";
import { config, path, recipe as voice } from "../../../gestalten/belt/index.js";

const SCAFFOLD = ["locks", "logs", "registry", "instances", "sessions"];

const SCOPES = [
  ["ledger", 0],
  ["repository", 0],
  ["registry", 0],
  ["instance", 0],
  ["mountpoint", 1],
];

// the ledger's .env schema lives in its own declaration now — commons/ledger/ledger.viva.js is the
// canonical one, cloned to <ledger>/ledger.viva.js at init; the schema is its `environment` export.
const SLOTS = Object.keys(v.primitives.instance.Ledger.properties).filter((slot) => slot !== "manifest");
const canonical = () => paladin.scope.repository.branch(`commons/ledger/${RECIPE}`);

const EMBEDDINGS = {
  config: async (ctx, mount) => ({
    mount,
    mode: "config",
    config: await config.writeShellConfig("VIVA_LEDGER_MOUNT", mount),
    persisted: true,
  }),
  manual: async (ctx, mount) => {
    const exportLine = `export VIVA_LEDGER_MOUNT="${mount}"`;
    await ctx.view.emit("report", {
      blocks: [{ heading: "add this to your shell rc (.bashrc / .zshrc):" }, { spans: [{ text: exportLine, tone: "link" }], depth: 1 }],
    });
    return { mount, mode: "manual", exportLine, persisted: false };
  },
};

export const install = new Vector().open(
  {
    nature: "/ledger/install",
    valence: "machine first-run — pick + persist the ledger home, scaffold locks/logs/registry/instances. Example: viva ledger/install ~/.viva",
    schema: v.object({ path: v.string().desc("the ledger home, skips the wizard. Example: ~/.viva").optional() }),
  },
  async (ctx) => {
    const target = ctx.signal.body[0];
    const home = paladin.scope.ledger.absolute;
    let choice;
    if (target) {
      choice = { mount: resolve(path.cwd(), target), persisted: false };
    } else if (!ctx.view.interactive) {
      choice = { mount: home, persisted: false };
    } else {
      const answer = await ctx.view.hold("form", {
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
      if (Object.hasOwn(answer, "aborted") || answer.action === "abort") return { aborted: true };
      choice = await EMBEDDINGS[answer.values.how](ctx, answer.values.mount);
    }

    const root = new Path(choice.mount);
    paladin.scopes([["ledger", () => true, () => root]]);
    Object.assign(paladin.ledger, { declaration: undefined, held: undefined });
    for (const sub of SCAFFOLD) {
      await Deno.mkdir(paladin.scope.ledger.branch(sub).absolute, { recursive: true });
    }

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

    // the .env is authored FROM the recipe's environment: absent → the whole scaffold; present → only
    // the keys it lacks are appended (groups, prose, defaults), what is there is never touched. so a
    // ledger that learns a slot re-runs init and its .env learns the slot's keys — whatever the ledger
    // declares has its env vars in the ledger.
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
    // what the file says now, at the ledger stratum — the seed below must see the defaults just written
    paladin.claim(await dotenv.load({ envPath: env.absolute }), "ledger", env.absolute);
    const seed = Object.entries(environment.properties).filter(
      ([key]) => paladin.env.get(key) === null && paladin.secret.get(key) === null,
    );

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
