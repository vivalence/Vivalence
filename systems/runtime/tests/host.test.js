import { Aperture, Controller, fromm, Path, specimen, Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";

const { host } = gestalten.belt;

const bearer = (type) => ({
  type,
  slug: type === "runtime" ? "runtime" : "probe",
  reference: new Path(type === "runtime" ? "/" : "/daemon/probe"),
  attach: null,
  controller: new Controller(),
  aperture: new Aperture(),
  entities: {},
  datamap: { shard: { scope: (work) => work() } },
  twitch: null,
  cortex: null,
  modes: {},
  services: {},
  domain: null,
});

const mask = (type, slug) => ({ manifest: { type, slug, traits: [] }, reference: new Path(`/mode/${type}/${slug}`) });

const execution = (seen) =>
  new Vector().affect(async (die) => {
    seen.push([die.host.type, die.mode.manifest.slug]);
    die.mode.aperture = new Aperture().open("/ping", () => die.mode.manifest.slug);
    die.mode.finalizers = [() => seen.push(["finalized", die.mode.manifest.slug])];
    die.mode.terminators = [() => seen.push(["terminated", die.mode.manifest.slug])];
  });

specimen.describe("gestalten.belt.host — one way to bear modes on either rung", () => {
  specimen.it("host() admits a bearer that has every HOST word and names the missing ones", () => {
    specimen.expect(host.host(bearer("daemon")).type).toBe("daemon");
    specimen.expect(host.host(bearer("runtime")).type).toBe("runtime");
    const { cortex, twitch, ...lacking } = bearer("runtime");
    specimen.expect(() => host.host(lacking)).toThrow("host runtime lacks twitch cortex");
  });

  for (const type of ["daemon", "runtime"]) {
    specimen.it(`${type}: seat → resolve → release — the same calls, the mode read through die.host`, async () => {
      const held = host.host(bearer(type));
      host.seat(held, [mask("game", "board"), mask("home", "lobby")]);
      specimen.expect(fromm.modes(held.modes).flat.map((mode) => mode.manifest.slug)).toEqual(["board", "lobby"]);
      specimen.expect(held.modes.game.board.stdout).toBeDefined();

      const seen = [];
      await host.resolve(held, execution(seen), {});
      specimen.expect(seen).toEqual([[type, "board"], [type, "lobby"], ["finalized", "board"], ["finalized", "lobby"]]);
      specimen.expect(held.aperture.branch("/mode/game/board/ping").effect?.()).toBe("board");

      await host.release(held);
      specimen.expect(seen.slice(-2)).toEqual([["terminated", "board"], ["terminated", "lobby"]]);
    });
  }
});
