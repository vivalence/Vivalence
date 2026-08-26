// expansion so one origin carries nine addresses; claims so one file lands at one stratum.
import { specimen, Env } from "@vivalence/typology";

const { describe, it, expect } = specimen;
const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];
const mk = () => new Env(STRATA);

describe("Env — ${VAR} expansion", () => {
  it("leaves a value with no reference untouched, whatever its type", () => {
    const env = mk();
    env.assign({ A: "plain", B: "", C: "has $ but no brace", D: "50%" }, "os");
    expect(env.get("A")).toBe("plain");
    expect(env.get("B")).toBe("");
    expect(env.get("C")).toBe("has $ but no brace");
    expect(env.get("D")).toBe("50%");
  });

  it("does NOT expand bare $VAR — only ${VAR}", () => {
    const env = mk();
    env.assign({ HOST: "example.com", BARE: "$HOST/x", BRACED: "${HOST}/x" }, "os");
    // a bare $ is far too easy to write inside a password. it stays verbatim.
    expect(env.get("BARE")).toBe("$HOST/x");
    expect(env.get("BRACED")).toBe("example.com/x");
  });

  it("expands across STRATA, in either load order", () => {
    const early = mk();
    early.assign({ ORIGIN: "http://localhost:2501" }, "ledger");
    early.assign({ SERVE: "${ORIGIN}/" }, "flag");
    expect(early.get("SERVE")).toBe("http://localhost:2501/");

    const late = mk();
    late.assign({ SERVE: "${ORIGIN}/" }, "flag");
    late.assign({ ORIGIN: "http://localhost:2501" }, "ledger");
    expect(late.get("SERVE")).toBe("http://localhost:2501/");
  });

  it("resolves a chain, and re-resolves after the root changes (it is LAZY, not baked)", () => {
    const env = mk();
    env.assign({
      ORIGIN: "http://localhost:2501",
      SERVE: "${ORIGIN}/",
      LIGHTHOUSE: "${SERVE}attached/process/lighthouse/multiplayer",
    }, "os");
    expect(env.get("LIGHTHOUSE")).toBe("http://localhost:2501/attached/process/lighthouse/multiplayer");
    // a stronger stratum answers the root; every derived value moves with it
    env.set("ORIGIN", "https://runtime.example.com", "flag");
    expect(env.get("LIGHTHOUSE")).toBe("https://runtime.example.com/attached/process/lighthouse/multiplayer");
  });

  it("expands several references in one value", () => {
    const env = mk();
    env.assign({ HOST: "0.0.0.0", PORT: "5555", SERVE: "http://${HOST}:${PORT}" }, "os");
    expect(env.get("SERVE")).toBe("http://0.0.0.0:5555");
  });

  it("leaves an UNRESOLVED reference literal, never blank", () => {
    const env = mk();
    env.assign({ SERVE: "${NOT_SET}/x" }, "os");
    // "${NOT_SET}/x" is visibly broken; "/x" would look plausible and boot something wrong.
    expect(env.get("SERVE")).toBe("${NOT_SET}/x");
  });

  it("throws on a self-reference and on a cycle, naming the path", () => {
    const self = mk();
    self.assign({ A: "${A}" }, "os");
    expect(() => self.get("A")).toThrow();

    const cycle = mk();
    cycle.assign({ A: "${B}", B: "${C}", C: "${A}" }, "os");
    let thrown = null;
    try { cycle.get("A"); } catch (error) { thrown = error; }
    expect(thrown?.message.includes("cyclic")).toBe(true);
    expect(thrown?.message.includes("A")).toBe(true);
    expect(thrown?.message.includes("B")).toBe(true);
  });

  it("a diamond is NOT a cycle — the same var reached twice must still resolve", () => {
    const env = mk();
    env.assign({ ROOT: "r", LEFT: "${ROOT}-l", RIGHT: "${ROOT}-r", BOTH: "${LEFT}+${RIGHT}" }, "os");
    expect(env.get("BOTH")).toBe("r-l+r-r");
  });

  it("does not cross bags: an env value cannot reference a secret", () => {
    const env = mk();
    const secret = mk();
    secret.assign({ SECRET_VIVA_JWT: "shh" }, "os");
    env.assign({ LEAK: "${SECRET_VIVA_JWT}" }, "os");
    // separate Env instances share nothing — the reference is simply unresolved
    expect(env.get("LEAK")).toBe("${SECRET_VIVA_JWT}");
  });

  it("vars stays RAW so doctor shows source text, while get() resolves", () => {
    const env = mk();
    env.assign({ ORIGIN: "http://x", SERVE: "${ORIGIN}/" }, "os");
    expect(env.vars.SERVE).toBe("${ORIGIN}/");
    expect(env.get("SERVE")).toBe("http://x/");
  });

  it("fallback still applies to a key that is absent entirely", () => {
    expect(mk().get("NOPE", "fallback")).toBe("fallback");
    expect(mk().get("NOPE")).toBe(null);
  });
});

describe("Env — observe (ambient) vs claim (role)", () => {
  const FILE = "/home/x/.viva/.env";

  it("an ambient read lands like any other assign", () => {
    const env = mk();
    env.observe({ VIVA_A: "1" }, ".env", FILE);
    expect(env.get("VIVA_A")).toBe("1");
    expect(env.provenance("VIVA_A")).toBe(".env");
  });

  it("a role claim on the SAME file evicts the ambient one — the file lands at its own stratum", () => {
    const env = mk();
    // standing in ~/.viva: the cwd scan grabs its .env at rank 4
    env.observe({ VIVA_INSTANCE_MOUNT: "/from/ledger" }, ".env", FILE);
    expect(env.provenance("VIVA_INSTANCE_MOUNT")).toBe(".env");
    // then the ledger reads its own file. rank 4 must not outrank the shell's own selection.
    env.claim({ VIVA_INSTANCE_MOUNT: "/from/ledger" }, "ledger", FILE);
    expect(env.provenance("VIVA_INSTANCE_MOUNT")).toBe("ledger");
    expect(env.strati("VIVA_INSTANCE_MOUNT").length).toBe(1);
  });

  it("the whole point: a session selection survives standing in the ledger directory", () => {
    const env = mk();
    env.assign({ VIVA_INSTANCE_MOUNT: "/instances/italian" }, "session");
    env.observe({ VIVA_INSTANCE_MOUNT: "/instances/language-learning" }, ".env", FILE);
    // without eviction, rank 4 beats rank 6 and you change instance by changing directory
    expect(env.get("VIVA_INSTANCE_MOUNT")).toBe("/instances/language-learning");
    env.claim({ VIVA_INSTANCE_MOUNT: "/instances/language-learning" }, "ledger", FILE);
    expect(env.get("VIVA_INSTANCE_MOUNT")).toBe("/instances/italian");
  });

  it("evicts exactly the keys the ambient read contributed, even if the claim carries fewer", () => {
    const env = mk();
    env.observe({ VIVA_A: "1", VIVA_B: "2", VIVA_C: "3" }, ".env", FILE);
    env.claim({ VIVA_A: "1" }, "ledger", FILE);
    expect(env.stratum(".env")).toEqual({});
    expect(env.provenance("VIVA_A")).toBe("ledger");
    expect(env.has("VIVA_B")).toBe(false);
  });

  it("a claim on a DIFFERENT file leaves the ambient one alone", () => {
    const env = mk();
    env.observe({ VIVA_A: "ambient" }, ".env", "/project/.env");
    env.claim({ VIVA_B: "role" }, "ledger", "/home/x/.viva/.env");
    expect(env.provenance("VIVA_A")).toBe(".env");
    expect(env.provenance("VIVA_B")).toBe("ledger");
  });

  it("a claim at the SAME stratum is a no-op eviction, not a self-erase", () => {
    const env = mk();
    env.observe({ VIVA_A: "1" }, ".env", FILE);
    env.claim({ VIVA_A: "2" }, ".env", FILE);
    expect(env.get("VIVA_A")).toBe("2");
  });

  it("claim with no source is just assign — nothing is evicted", () => {
    const env = mk();
    env.observe({ VIVA_A: "ambient" }, ".env", FILE);
    env.claim({ VIVA_B: "1" }, "ledger");
    expect(env.provenance("VIVA_A")).toBe(".env");
  });

  it("a second observe of the same file re-points the ambient record", () => {
    const env = mk();
    env.observe({ VIVA_A: "1" }, "cwd", FILE);
    env.observe({ VIVA_A: "1" }, ".env", FILE);
    env.claim({ VIVA_A: "1" }, "ledger", FILE);
    expect(env.strati("VIVA_A").length).toBe(1);
    expect(env.provenance("VIVA_A")).toBe("ledger");
  });
});
