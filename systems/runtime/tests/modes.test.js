import { Aperture, Controller, fromm, Mode, Path, specimen, Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";

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
    seen.push([die.context.type, die.mode.manifest.slug]);
    die.mode.aperture = new Aperture().open("/ping", () => die.mode.manifest.slug);
    die.mode.finalizers = [() => seen.push(["finalized", die.mode.manifest.slug])];
    die.mode.terminators = [() => seen.push(["terminated", die.mode.manifest.slug])];
  });

specimen.describe("gestalten.belt.modes — one way to run modes on either rung", () => {
  for (const type of ["daemon", "runtime"]) {
    specimen.it(`${type}: resolve → release — the same calls, the mode read through die.context`, async () => {
      const context = rung(type);
      for (const held of [mask("game", "board"), mask("home", "lobby")]) {
        (context.modes[held.manifest.type] ??= {})[held.manifest.slug] = Object.assign(new Mode(held), { stdout: context.controller.stdout.branch(held.reference.absolute) });
      }
      specimen.expect(fromm.modes(context.modes).flat.map((mode) => mode.manifest.slug)).toEqual(["board", "lobby"]);

      const seen = [];
      await modes.resolve(context, execution(seen), {});
      specimen.expect(seen).toEqual([[type, "board"], [type, "lobby"], ["finalized", "board"], ["finalized", "lobby"]]);
      specimen.expect(context.aperture.branch("/mode/game/board/ping").effect?.()).toBe("board");

      await modes.release(context);
      specimen.expect(seen.slice(-2)).toEqual([["terminated", "board"], ["terminated", "lobby"]]);
    });
  }
});
