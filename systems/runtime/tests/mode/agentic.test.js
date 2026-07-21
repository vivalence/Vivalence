import { specimen, shard, steer } from "@vivalence/typology";
import { Vector, Mode, Aperture, Path, ToolCall } from "@vivalence/typology";
import { AGENTIC } from "@vivalence/runtime/daemon/traits";

function provision(mode, daemon) {
  mode.tools = new Vector();
  mode.tools.use(shard.context.bind("daemon", daemon));
  mode.tools.use(shard.context.bind("mode", mode));
  if (mode.module.tools) mode.tools.slurp(mode.module.tools);
}

function buildMode({ slug, traits = [], tools } = {}) {
  const mode = new Mode({ manifest: { type: "teacher", slug, traits } });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/teacher/${slug}`);
  if (tools) mode.module.tools = tools;
  return mode;
}

function toolVector(nature, effect) {
  const vector = new Vector();
  vector.open({ nature }, effect);
  return vector;
}

function daemonOf(modes) {
  return {
    modes: { teacher: Object.fromEntries(modes.map((mode) => [mode.slug, mode])) },
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };
}

function names(tools) {
  return steer.trie
    .rollup(tools, () => null)
    .map(({ steps }) => shard.hallucinate.nameOf(steps));
}

specimen.describe("AGENTIC trait", () => {
  specimen.it("harvests every TOOLED source's tools under its slug", () => {
    const aprende = buildMode({
      slug: "aprende",
      traits: ["TOOLED"],
      tools: toolVector("flashcard", () => "card"),
    });
    const riddler = buildMode({
      slug: "riddler",
      traits: ["TOOLED"],
      tools: toolVector("riddle", () => "riddle"),
    });
    const hub = buildMode({ slug: "hub", traits: ["AGENTIC"] });
    const daemon = daemonOf([aprende, riddler, hub]);
    [aprende, riddler, hub].forEach((mode) => provision(mode, daemon));

    AGENTIC(hub, daemon);

    const harvested = names(hub.tools);
    specimen.expect(harvested).toContain("aprende_flashcard");
    specimen.expect(harvested).toContain("riddler_riddle");
  });

  specimen.it("skips modes that don't implement TOOLED", () => {
    const aprende = buildMode({
      slug: "aprende",
      traits: ["TOOLED"],
      tools: toolVector("flashcard", () => "card"),
    });
    const plain = buildMode({
      slug: "plain",
      traits: [],
      tools: toolVector("secret", () => "secret"),
    });
    const hub = buildMode({ slug: "hub", traits: ["AGENTIC"] });
    const daemon = daemonOf([aprende, plain, hub]);
    [aprende, plain, hub].forEach((mode) => provision(mode, daemon));

    AGENTIC(hub, daemon);

    const harvested = names(hub.tools);
    specimen.expect(harvested).toContain("aprende_flashcard");
    specimen.expect(harvested).not.toContain("plain_secret");
  });

  specimen.it("does not harvest itself", () => {
    const hub = buildMode({
      slug: "hub",
      traits: ["TOOLED", "AGENTIC"],
      tools: toolVector("own", () => "own"),
    });
    const daemon = daemonOf([hub]);
    provision(hub, daemon);

    AGENTIC(hub, daemon);

    const harvested = names(hub.tools);
    specimen.expect(harvested).toContain("own");
    specimen.expect(harvested).not.toContain("hub_own");
  });

  specimen.it("dispatches a harvested tool through the source mode's ctx", async () => {
    let captured = null;
    const aprende = buildMode({
      slug: "aprende",
      traits: ["TOOLED"],
      tools: toolVector("flashcard", (ctx) => {
        captured = { daemon: ctx.daemon, mode: ctx.mode, input: ctx.input };
        return "card";
      }),
    });
    const hub = buildMode({ slug: "hub", traits: ["AGENTIC"] });
    const daemon = daemonOf([aprende, hub]);
    [aprende, hub].forEach((mode) => provision(mode, daemon));

    AGENTIC(hub, daemon);

    const result = await steer.dispatch.invoke(
      hub.tools,
      new ToolCall("aprende_flashcard").signal,
      steer.strategy.guarded,
    )({ term: "gato" });

    specimen.expect(result).toBe("card");
    specimen.expect(captured.mode).toBe(aprende);
    specimen.expect(captured.daemon).toBe(daemon);
    specimen.expect(captured.input).toEqual({ term: "gato" });
  });
});
