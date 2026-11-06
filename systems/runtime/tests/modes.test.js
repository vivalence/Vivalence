import {
  Aperture,
  contexts,
  Controller,
  fromm,
  Mode,
  monad,
  Path,
  shape,
  shard,
  specimen,
  Vector,
} from "@vivalence/typology";
import { gestalten, lifecycle } from "@vivalence/runtime";

const { modes } = gestalten.belt;

const rung = (type) => ({
  type,
  slug: type === "runtime" ? "runtime" : "probe",
  reference: new Path(type === "runtime" ? "/" : "/daemon/probe"),
  controller: new Controller(),
  aperture: new Aperture(),
  datamap: { shard: { scope: (work) => work() } },
  modes: {},
});

const mask = (type, slug) => ({ manifest: { type, slug, traits: [] }, reference: new Path(`/mode/${type}/${slug}`) });

const execution = (seen) =>
  new Vector().affect(async (die) => {
    seen.push([die.reference.absolute, die.mode.manifest.slug]);
    die.mode.aperture = new Aperture().open("/ping", () => die.mode.manifest.slug);
    die.mode.finalizers = [() => seen.push(["finalized", die.mode.manifest.slug])];
    die.mode.terminators = [() => seen.push(["terminated", die.mode.manifest.slug])];
  });

const factory = (seen) => (mode, traits) =>
  monad.kleisli([
    (context) => ({
      ...shard.context.lift(contexts.modeDie, context),
      mode,
      traits,
    }),
    shape.monad.execute(execution(seen)),
  ]);

specimen.describe("gestalten.belt.modes — one way to run modes on either rung", () => {
  for (const type of ["daemon", "runtime"]) {
    specimen.it(`${type}: resolve → release — the mode die lifted flat off its parent`, async () => {
      const context = rung(type);
      for (const held of [mask("game", "board"), mask("home", "lobby")]) {
        (context.modes[held.manifest.type] ??= {})[held.manifest.slug] = Object.assign(new Mode(held), { stdout: context.controller.stdout.branch(held.reference.absolute) });
      }
      specimen.expect(fromm.modes(context.modes).flat.map((mode) => mode.manifest.slug)).toEqual(["board", "lobby"]);

      const seen = [];
      await modes.resolve(context, factory(seen), {});
      const reference = context.reference.absolute;
      specimen.expect(seen).toEqual([
        [reference, "board"],
        [reference, "lobby"],
        ["finalized", "board"],
        ["finalized", "lobby"],
      ]);
      specimen.expect(context.aperture.branch("/mode/game/board/ping").effect?.()).toBe("board");

      await modes.release(context);
      specimen.expect(seen.slice(-2)).toEqual([["terminated", "board"], ["terminated", "lobby"]]);
    });
  }
});

specimen.describe("lifecycle.mode.population.providers — a mode's own consume over its host's providers", () => {
  const citizen = (slug, traits, tools) => ({
    manifest: { slug, traits },
    tools,
    provider: (held) => ({ of: held.manifest.slug }),
  });

  specimen.it("each consumed citizen's provider runs with its citizen and lands under its key, over the host's; TOOLING hangs the tools; the host's bag is not mutated", async () => {
    const engine = { of: "host" };
    const host = { engine, nlp: { of: "nlp" } };
    const modeDie = {
      providers: host,
      mode: { consume: { reader: citizen("reader", ["TOOLING"], "reader tools"), engine: citizen("deep", [], "unworn") } },
    };
    const order = [];
    await lifecycle.mode.population.providers(modeDie, async () => order.push(Object.keys(modeDie.providers)));
    specimen.expect(modeDie.providers).toEqual({
      engine: { of: "deep" },
      nlp: { of: "nlp" },
      reader: { of: "reader", tools: "reader tools" },
    });
    specimen.expect(modeDie.providers.nlp).toBe(host.nlp);
    specimen.expect(host).toEqual({ engine, nlp: { of: "nlp" } });
    specimen.expect(order).toEqual([["engine", "nlp", "reader"]]);
  });

  specimen.it("a mode consuming nothing holds its host's providers, the same live things in its own bag", async () => {
    const host = { engine: { of: "host" } };
    const modeDie = { providers: host, mode: { consume: {} } };
    await lifecycle.mode.population.providers(modeDie, async () => {});
    specimen.expect(modeDie.providers).toEqual(host);
    specimen.expect(modeDie.providers.engine).toBe(host.engine);
    specimen.expect(modeDie.providers).not.toBe(host);
  });

  specimen.it("the beat runs after stdout and before core — a mode's aperture and tools are built over its own providers", () => {
    const { stdout, providers, core } = lifecycle.mode.population;
    specimen.expect(lifecycle.mode.execution.carry).toEqual([stdout, providers, core]);
  });
});
