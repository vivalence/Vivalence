import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url, traits, v } from "@vivalence/typology";

const { InstanceMask, InstanceRecipe, Mountpoint, ModeMasks, DaemonMask, RuntimeMask, ServiceMask, LighthouseMask, ClientMask } = v.primitives.instance;

const JWT = "a-signing-secret-of-twenty-four-or-more";
const runtime = (held = {}) => ({ manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" }, secrets: { jwt: JWT }, ...held });
const recipe = (held = {}) => ({ manifest: { type: "instance", slug: "probe" }, environment: {}, ...held });
const daemon = (held = {}) => ({
  manifest: { type: "daemon", slug: "hello" },
  mountpoint: "/m/daemon_hello",
  datamap: { module: "@commons/datamap/libsql", mountpoint: "/m/daemon_hello", statics: { db: { file: "hello.viva.db" } } },
  ...held,
});

const sentences = (value) => InstanceMask.faults(value).map(({ at, reason }) => `${at} ${reason}`);

describe("v.primitives.instance — one schematic for the settled unit", () => {
  it("cast fills what a recipe leaves out — lists, statics, consume, traits", () => {
    const held = InstanceMask.cast(recipe({ daemons: [daemon()] }));
    expect(held.clients).toEqual([]);
    expect(held.services).toEqual([]);
    expect(held.manifest.traits).toEqual([]);
    expect(held.daemons[0].statics).toEqual({});
    expect(held.daemons[0].modes).toEqual([]);
    expect(held.daemons[0].consume).toEqual({});
    expect(held.daemons[0].hallucinators).toEqual([]);
    expect(sentences(held)).toEqual([]);
  });

  it("a mode consumes as its daemon does — cast fills an empty consume on a mode mask, a declared one stays", () => {
    const reader = { module: "@commons/service/reader" };
    const held = InstanceMask.cast(recipe({ daemons: [daemon({ modes: [{ module: "@chess/study/analysis", consume: { reader } }, { module: "@chess/game/play" }] })] }));
    expect(held.daemons[0].modes[0].consume).toEqual({ reader });
    expect(held.daemons[0].modes[1].consume).toEqual({});
    expect(sentences(held)).toEqual([]);
  });

  it("a daemon owes only its manifest — no lighthouse, no datamap of its own; the lighthouse is the runtime's", () => {
    const bare = InstanceMask.cast(recipe({ daemons: [{ manifest: { type: "daemon", slug: "hello" }, mountpoint: "/m/daemon_hello" }] }));
    expect(sentences(bare)).toEqual([]);
    expect("lighthouse" in v.primitives.instance).toBe(false);
  });

  it("decode mints the prototypes once: Url at every serve/remote, Path at every mountpoint", () => {
    const held = InstanceMask.decode(InstanceMask.cast(recipe({ runtime: runtime(), daemons: [daemon()] })));
    expect(held.runtime.statics.serve).toBeInstanceOf(Url);
    expect(held.daemons[0].mountpoint).toBeInstanceOf(Path);
  });

  it("the modes admits an identifier and a mode mask — an inline module object is refused", () => {
    const modes = [
      "@commons/playground/spawner",
      { module: "@vcompany/office/vdex", mountpoint: "/jdex", statics: { formats: ["md"] } },
      { module: "@vcompany/office/chat", mountpoint: null },
    ];
    expect(v.faults(ModeMasks, modes).map(({ at, reason }) => `${at} ${reason}`)).toContain("/1 must have required properties traits, trait, consume, hallucinators");
    const settled = ModeMasks.cast(modes);
    expect(v.faults(ModeMasks, settled)).toEqual([]);
    expect(settled.map((entry) => entry.consume)).toEqual([undefined, {}, {}]);
    expect(settled.map((entry) => entry.hallucinators)).toEqual([undefined, [], []]);
    const held = v.decode(ModeMasks, settled);
    expect(held[1].mountpoint).toBeInstanceOf(Path);
    expect(held[1].mountpoint.absolute).toBe("/jdex");
    expect(held[2].mountpoint).toBe(null);
    expect(v.faults(ModeMasks, [{ manifest: { type: "game", slug: "inline" }, statics: {} }]).length).toBeGreaterThan(0);
  });

  it("every host's mask holds hallucinators — runtime · service · daemon · mode default to none, a recipe declares them on each", () => {
    const service = { manifest: { type: "service", slug: "svc" }, module: "m", mountpoint: "/m/service_svc", datamap: { module: "m" } };
    expect(RuntimeMask.cast(runtime()).hallucinators).toEqual([]);
    expect(ServiceMask.cast(service).hallucinators).toEqual([]);
    expect(DaemonMask.cast(daemon()).hallucinators).toEqual([]);
    expect(ModeMasks.cast([{ module: "@chess/game/board" }])[0].hallucinators).toEqual([]);
    const declared = [{ module: "@commons/hallucinator/elevenlabs", faculties: [{ type: "speech", id: "leandro" }] }];
    const authored = {
      manifest: { type: "instance", slug: "probe" },
      runtime: { statics: { serve: "${VIVA_RUNTIME_SERVE}" }, hallucinators: declared, modes: [{ module: "@commons/harness/runtime", hallucinators: declared }] },
      services: [{ manifest: { type: "service", slug: "svc" }, module: "m", hallucinators: declared }],
      daemons: [{ manifest: { type: "daemon", slug: "hello" }, hallucinators: declared, modes: [{ module: "@chess/game/board", hallucinators: declared }] }],
    };
    expect(InstanceRecipe.faults(authored)).toEqual([]);
  });

  it("the runtime's manifest is a host's — type and slug default to runtime, its hallucinators to none — and it signs with a secret of 24+", () => {
    expect(RuntimeMask.faults(RuntimeMask.cast(runtime()))).toEqual([]);
    expect(RuntimeMask.cast(runtime({ manifest: {} })).manifest).toEqual({ type: "runtime", slug: "runtime", traits: [] });
    const { manifest, ...unnamed } = runtime();
    expect(RuntimeMask.cast(unnamed).manifest).toEqual({ type: "runtime", slug: "runtime", traits: [] });
    expect(RuntimeMask.cast(unnamed).hallucinators).toEqual([]);
    expect(InstanceRecipe.faults({ manifest: { type: "instance", slug: "probe" }, runtime: { statics: { serve: "${VIVA_RUNTIME_SERVE}" } } })).toEqual([]);
    expect(RuntimeMask.faults(RuntimeMask.cast(runtime({ secrets: { jwt: "short" } }))).map(({ at }) => at)).toEqual(["/secrets/jwt"]);
    expect(RuntimeMask.faults(RuntimeMask.cast({ manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" } }))).toEqual([]);
  });

  it("the lighthouse is its own slot — a 24+ secret, traits default to none, trait.AUTOLOGIN defaults to localhost, the mask takes a reference and the trait words only", () => {
    expect(LighthouseMask.cast({ secrets: { jwt: JWT } })).toEqual({ secrets: { jwt: JWT }, traits: [], trait: { AUTOLOGIN: { username: "localhost" } } });
    expect(LighthouseMask.faults(LighthouseMask.cast({ secrets: { jwt: "short" }, traits: ["JOINABLE"] })).map(({ at }) => at)).toEqual(["/secrets/jwt"]);
    const worn = LighthouseMask.cast({ secrets: { jwt: JWT }, traits: ["AUTOSIGNUP"] });
    expect(LighthouseMask.faults(worn)).toEqual([]);
    expect([...new Set(LighthouseMask.faults({ secrets: { jwt: JWT }, traits: ["AJAR"] }).map(({ at }) => at))]).toEqual(["/traits/0"]);
    expect(InstanceMask.cast(recipe({ runtime: runtime(), lighthouse: { secrets: { jwt: JWT }, traits: ["JOINABLE"] } })).lighthouse.traits).toEqual(["JOINABLE"]);
    expect(InstanceRecipe.faults({ manifest: { type: "instance", slug: "probe" }, lighthouse: { secrets: { jwt: "${SECRET_VIVA_JWT}" }, traits: ["JOINABLE"] } })).toEqual([]);
    expect(InstanceRecipe.faults({ manifest: { type: "instance", slug: "probe" }, lighthouse: { secrets: { jwt: "literal" } } }).map(({ at }) => at)).toEqual(["/lighthouse/secrets/jwt"]);
  });

  it("the schematic knows every mountpoint — collect walks daemons, datamaps, services and modes modes, skipping null", () => {
    const held = InstanceMask.cast(
      recipe({
        services: [{ manifest: { type: "service", slug: "nlp" }, module: "@commons/service/nlp-stanza", mountpoint: "/m/service_nlp", datamap: { module: "@commons/datamap/libsql", mountpoint: "/m/service_nlp" } }],
        daemons: [daemon({ modes: [{ module: "@vcompany/office/vdex", mountpoint: "/jdex" }, { module: "@vcompany/office/chat", mountpoint: null }] })],
      }),
    );
    const mountpoints = v.collect(InstanceMask, held, Mountpoint);
    expect(mountpoints.map(({ at }) => at)).toEqual([
      "/services/0/mountpoint",
      "/services/0/datamap/mountpoint",
      "/daemons/0/mountpoint",
      "/daemons/0/modes/0/mountpoint",
    ]);
    expect(mountpoints.map(({ value }) => value)).toEqual(["/m/service_nlp", "/m/service_nlp", "/m/daemon_hello", "/jdex"]);
    expect(InstanceMask.collect(InstanceMask.decode(held), Mountpoint).every(({ value }) => value instanceof Path)).toBe(true);
  });

  it("a mountpoint is declared absolute", () => {
    expect(v.faults(Mountpoint, "/absolute/x")).toEqual([]);
    expect(v.faults(Mountpoint, "./relative")).toEqual([{ at: "/", reason: "must be an absolute path" }]);
    expect(DaemonMask.faults(DaemonMask.cast(daemon({ mountpoint: "relative" }))).map(({ at }) => at)).toEqual(["/mountpoint"]);
  });
});

describe("v.primitives.instance.InstanceRecipe — the file as authored: references, no derived mountpoints, every key named", () => {
  const mask = (held = {}) => ({
    manifest: { type: "instance", slug: "hello-world", version: "0.0.1" },
    runtime: {
      manifest: { slug: "runtime" },
      statics: { serve: "${VIVA_RUNTIME_SERVE}", remote: "${PUBLIC_VIVA_RUNTIME_REMOTE}" },
      secrets: { jwt: "${SECRET_VIVA_JWT}" },
      hallucinators: [{ module: "@commons/hallucinator/anthropic", secrets: { key: "${SECRET_VIVA_ANTHROPIC_API_KEY}" }, faculties: [{ type: "dialogue", id: "claude-haiku-5-5" }] }],
    },
    datamap: { module: "@commons/datamap/libsql" },
    clients: [{ manifest: { type: "client", slug: "anima" }, statics: { serve: "${VIVA_CLIENT_ANIMA_SERVE}" } }],
    daemons: [{ manifest: { type: "daemon", slug: "hello", version: "0.0.1" }, modes: ["./mode.viva.js", { module: "@commons/editor/media", statics: { root: "${VIVA_ROOT}" } }], consume: { reader: { module: "@commons/service/reader" } } }],
    environment: { type: "object", required: ["VIVA_RUNTIME_SERVE", "SECRET_VIVA_JWT"], properties: { VIVA_RUNTIME_SERVE: { type: "string" }, SECRET_VIVA_JWT: { type: "string", minLength: 24 } }, additionalProperties: false },
    ...held,
  });
  const faults = (value) => InstanceRecipe.faults(value).map(({ at, reason }) => `${at} ${reason}`);

  it("the authored hello-world shape passes whole", () => {
    expect(faults(mask())).toEqual([]);
  });

  it("a client carries HOME on its MANIFEST, config in trait.HOME.reference; a bare home or a top-level traits is refused", () => {
    expect(faults(mask({ clients: [{ manifest: { type: "client", slug: "ghost", traits: ["HOME"] }, trait: { HOME: { reference: "/daemon/memo/mode/srs/memo" } } }] }))).toEqual([]);
    expect(faults(mask({ clients: [{ manifest: { type: "client", slug: "ghost" }, home: "/daemon/memo/mode/srs/memo" }] }))).toEqual(["/clients/0 must not have additional properties"]);
    expect(faults(mask({ clients: [{ manifest: { type: "client", slug: "ghost" }, traits: ["HOME"] }] }))).toEqual(["/clients/0 must not have additional properties"]);
  });

  it("a client's traits default to none on the manifest; HOME reads through the same claim a user's does", () => {
    expect(ClientMask.cast({ manifest: { type: "client", slug: "ghost" } })).toEqual({ manifest: { type: "client", slug: "ghost", traits: [] }, statics: {}, trait: {} });
    const homed = { id: "u-1", traits: ["HOME"], trait: { HOME: { reference: "/daemon/memo/mode/srs/memo" } } };
    expect(traits.claim(homed, "HOME", { HOME: v.primitives.Home })).toEqual(traits.cast(homed, v.user.traits).HOME);
  });

  it("a migrated shelf that still says lighthouse is refused with the key named", () => {
    expect(faults(mask({ lighthouse: { module: "@commons/lighthouse/multiplayer" } }))).toEqual(["/lighthouse must have required properties secrets", "/lighthouse must not have additional properties"]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, lighthouse: {} }] }))).toEqual(["/daemons/0 must not have additional properties"]);
  });

  it("a secret is a ${SECRET_…} reference, never a value; a static is any string", () => {
    expect(faults(mask({ runtime: { manifest: { slug: "runtime" }, secrets: { jwt: "a-literal-secret-in-the-file" } } })).join(" ")).toContain("/runtime/secrets/jwt");
    expect(faults(mask({ runtime: { hallucinators: [{ module: "m", secrets: { key: "${VIVA_NOT_A_SECRET}" }, faculties: [] }] } })).join(" ")).toContain("/runtime/hallucinators/0/secrets/key");
    expect(faults(mask({ datamap: { module: "m", statics: { file: "plain.db" } } }))).toEqual([]);
  });

  it("hallucinators are a host's: the root holds none, and no tiers — a level restates a faculty by id alone, a tier is a name from typology's table (m126 Q1 · Q6)", () => {
    const voice = (faculties) => [{ module: "@commons/hallucinator/elevenlabs", faculties }];
    expect(faults(mask({ hallucinators: voice([{ type: "speech", id: "leandro" }]) }))).toEqual(["/ must not have additional properties"]);
    expect(faults(mask({ tiers: { fast: [0.4, 1.0, 0.8] } }))).toEqual(["/ must not have additional properties"]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", hallucinators: voice([{ id: "leandro", tier: "tongue" }]) }] }] }))).toEqual([]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, hallucinators: [{ module: "@commons/hallucinator/elevenlabs" }] }] })).join(" ")).toContain("/daemons/0/hallucinators/0 must have required properties faculties");
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, hallucinators: voice([{ id: "leandro", tier: "loud" }]) }] })).join(" ")).toContain("/daemons/0/hallucinators/0/faculties/0/tier");
    expect(Object.keys(InstanceMask.properties)).not.toContain("hallucinators");
    expect(Object.keys(InstanceMask.properties)).not.toContain("tiers");
  });

  it("a mode entry's traits sit at its top, and it holds no manifest — a manifest on an entry is refused, its traits with it (m126 Q43 · Q44)", () => {
    const entry = (held) => mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", ...held }] }] });
    expect(faults(entry({ traits: ["HARNESS", "TOOLING"] }))).toEqual([]);
    expect(faults(entry({ manifest: { name: "X" } }))).toContain("/daemons/0/modes/0 must not have additional properties");
    expect(faults(entry({ manifest: { traits: ["HARNESS"] } }))).toContain("/daemons/0/modes/0 must not have additional properties");
    const [held] = ModeMasks.cast([{ module: "m" }]);
    expect([held.traits, "manifest" in held]).toEqual([[], false]);
  });

  it("a mode entry carries trait config for HARNESSED · CONVERSATIONAL · TOOLED · PRIMED alone — an overwrite typed by the thread twin, every key optional, never filled; the mask holds {} when the recipe says none (m126 Q40 · Q46)", () => {
    const entry = (held) => mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", ...held }] }] });
    const trait = { HARNESSED: { tier: "fast", rounds: 6 }, TOOLED: { "/daemon/x/mode/game/dojo": "eager" } };
    expect(faults(entry({ traits: ["HARNESS", "TOOLING"], trait }))).toEqual([]);
    expect(faults(entry({ trait: { SURFACED: {} } })).join(" ")).toContain("/daemons/0/modes/0/trait must not have additional properties");
    expect(faults(entry({ trait: { TOOLED: { "/a": "always" } } })).join(" ")).toContain("/daemons/0/modes/0/trait/TOOLED");
    expect(faults(entry({ trait: { HARNESSED: { rounds: 101 } } })).join(" ")).toContain("/daemons/0/modes/0/trait/HARNESSED/rounds must be <= 100");
    expect(faults(entry({ trait: { CONVERSATIONAL: { polish: { engaged: "yes" } } } })).join(" ")).toContain("/daemons/0/modes/0/trait/CONVERSATIONAL/polish/engaged must be boolean");
    expect(faults(entry({ trait: { HARNESSED: { temperature: 1 } } })).join(" ")).toContain("/daemons/0/modes/0/trait/HARNESSED must not have additional properties");
    const { ModeRecipeTrait, ModeMaskTrait } = v.primitives.instance;
    expect(JSON.stringify(ModeRecipeTrait)).toBe(JSON.stringify(ModeMaskTrait));
    expect(ModeMaskTrait.cast({ HARNESSED: { tier: "fast", rounds: 6 }, CONVERSATIONAL: { polish: {} } })).toEqual({ HARNESSED: { tier: "fast", rounds: 6 }, CONVERSATIONAL: { polish: {} } });
    expect(ModeMasks.cast([{ module: "m", trait: { HARNESSED: { rounds: 6 } } }])[0].trait).toEqual({ HARNESSED: { rounds: 6 } });
    expect(ModeMasks.cast([{ module: "m" }])[0].trait).toEqual({});
  });

  it("a mode mask carries module · traits · trait · mountpoint (nullable) · statics · secrets · consume · hallucinators and nothing else", () => {
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", mountpoint: null }] }] }))).toEqual([]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", consume: { reader: { module: "@commons/service/reader" } } }] }] }))).toEqual([]);
    expect(faults(mask({ runtime: { modes: [{ module: "m", consume: { reader: { module: "@commons/service/reader" } } }] } }))).toEqual([]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", consume: { reader: "@commons/service/reader" } }] }] })).join(" ")).toContain("/daemons/0/modes/0/consume/reader must be object");
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", application: {} }] }] })).join(" ")).toContain("/daemons/0/modes/0");
  });
});

describe("recipe in, mask out — every pair is a named primitive (m126 Q37)", () => {
  it("a faculty has three forms: the recipe's by id alone, the mask's typed, the one a provider built", () => {
    const { FacultyRecipe, FacultyMask, Faculty } = v.primitives.hallucination;
    expect(FacultyRecipe.faults({ id: "leandro", tier: "tongue" })).toEqual([]);
    expect(FacultyMask.faults({ id: "leandro", tier: "tongue" })).toEqual([{ at: "/", reason: "must have required properties type" }]);
    expect(FacultyMask.faults({ type: "speech", id: "leandro", tier: "tongue" })).toEqual([]);
    expect(Faculty.faults({ type: "speech", id: "leandro", tier: "tongue" }).map(({ reason }) => reason)).toEqual(["must have required properties tune, via"]);
  });

  it("every type holds a recipe and a mask under one name; the ledger file is a recipe alone", () => {
    const names = Object.keys(v.primitives.instance);
    const TYPES = ["Instance", "Runtime", "Daemon", "Mode", "Service", "Client", "Lighthouse", "Datamap", "Hallucinator", "Statics", "Secrets", "Environment"];
    for (const type of TYPES) {
      expect(names).toContain(`${type}Recipe`);
      expect(names).toContain(`${type}Mask`);
    }
    expect(names).toContain("Recipe");
    expect(names).toContain("Mask");
    expect(names).toContain("LedgerRecipe");
    expect(names).not.toContain("LedgerMask");
    expect(names.filter((name) => TYPES.includes(name) || name === "Ledger")).toEqual([]);
  });

  it("what a mode's HARNESS · CONVERSATION need is typology's — REQUIRES, a trait met by any ONE of its lists (m126 Q41)", () => {
    expect(v.primitives.hallucination.REQUIRES).toEqual({ HARNESS: [["dialogue"]], CONVERSATION: [["call"], ["verbatim", "dialogue", "speech"]] });
  });

  it("a hallucinator's faculties are the primitives, on both sides", () => {
    const { FacultyRecipe, FacultyMask } = v.primitives.hallucination;
    const { HallucinatorRecipe, HallucinatorMask } = v.primitives.instance;
    expect(JSON.stringify(HallucinatorRecipe.properties.faculties.items)).toBe(JSON.stringify(FacultyRecipe));
    expect(JSON.stringify(HallucinatorMask.properties.faculties.items)).toBe(JSON.stringify(FacultyMask));
  });
});
