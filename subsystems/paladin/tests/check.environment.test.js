// authored schema against observed record. three things are ever wrong: undocumented, required, invalid.
import { specimen, v } from "@vivalence/typology";
import { Paladin } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;

const mk = (pairs = {}, secrets = {}) => {
  const paladin = new Paladin();
  paladin.env.assign(pairs, "flag");
  paladin.secret.assign(secrets, "flag");
  return paladin;
};
const rowsOf = (paladin, requirements, environment) =>
  Object.fromEntries(
    paladin.check.environment({ requirements, environment }).map((row) => [row.key, row]),
  );
const read = (at, key, extra = {}) => ({ at, read: [key], unset: [], ...extra });
const unread = (at, key) => ({ at, read: [key], unset: [key] });

describe("check.environment", () => {
  it("described and set → ok", () => {
    const rows = rowsOf(mk({ VIVA_A: "1" }), [read("runtime.serve", "VIVA_A")], v.environment({
      VIVA_A: v.string().desc("a").group("addresses"),
    }));
    expect(rows.VIVA_A.verdict).toBe("ok");
    expect(rows.VIVA_A.at).toBe("runtime.serve");
    expect(rows.VIVA_A.describe).toBe("a");
    expect(rows.VIVA_A.group).toBe("addresses");
    expect(rows.VIVA_A.required).toBe(true);
  });

  it("read by a thunk but described nowhere → UNDOCUMENTED, and it FAILS", () => {
    const list = mk({ VIVA_A: "1" }).check.environment({
      requirements: [read("runtime.serve", "VIVA_A")],
      environment: v.environment({}),
    });
    expect(list[0].verdict).toBe("UNDOCUMENTED");
    expect(list.fails).toBe(true);
  });

  it("unset and not optional → REQUIRED, and it FAILS — however well the thunk coped", () => {
    const list = mk().check.environment({
      requirements: [unread("runtime.serve", "VIVA_A")],
      environment: v.environment({ VIVA_A: v.string().desc("a") }),
    });
    expect(list[0].verdict).toBe("REQUIRED");
    expect(list.fails).toBe(true);
  });

  it("unset and .optional() → optional, and it does not fail", () => {
    const list = mk().check.environment({
      requirements: [unread("daemon[hello].hallucinators", "SECRET_VIVA_K")],
      environment: v.environment({ SECRET_VIVA_K: v.string().desc("k").optional() }),
    });
    expect(list[0].verdict).toBe("optional");
    expect(list[0].required).toBe(false);
    expect(list.fails).toBe(false);
  });

  it("set but failing its type → INVALID with the reason, and it FAILS", () => {
    const list = mk({ VIVA_A: "localhost:2501" }).check.environment({
      requirements: [read("runtime.serve", "VIVA_A")],
      environment: v.environment({ VIVA_A: v.url().desc("a") }),
    });
    expect(list[0].verdict).toBe("INVALID");
    expect(typeof list[0].reason).toBe("string");
    expect(list.fails).toBe(true);
    expect(list[0].value).toBe("localhost:2501");
  });

  it("a secret is validated against its real value and still reported as ***", () => {
    const short = rowsOf(mk({}, { SECRET_VIVA_JWT: "tooshort" }), [], v.environment({
      SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("jwt"),
    }));
    expect(short.SECRET_VIVA_JWT.verdict).toBe("INVALID");
    expect(short.SECRET_VIVA_JWT.value).toBe("***");
    expect(JSON.stringify(short).includes("tooshort")).toBe(false);
    const long = rowsOf(mk({}, { SECRET_VIVA_JWT: "x".repeat(32) }), [], v.environment({
      SECRET_VIVA_JWT: v.string({ minLength: 24 }).desc("jwt"),
    }));
    expect(long.SECRET_VIVA_JWT.verdict).toBe("documented");
  });

  it("described, unread, blank, not optional → REQUIRED — the publish() and container consumers", () => {
    const blank = mk().check.environment({
      requirements: [],
      environment: v.environment({ VIVA_SERVICE_NLP_PORT: v.string().desc("port") }),
    });
    expect(blank[0].verdict).toBe("REQUIRED");
    expect(blank.fails).toBe(true);

    const set = mk({ VIVA_SERVICE_NLP_PORT: "8080" }).check.environment({
      requirements: [],
      environment: v.environment({ VIVA_SERVICE_NLP_PORT: v.string().desc("port") }),
    });
    expect(set[0].verdict).toBe("documented");
    expect(set[0].at).toBe(null);
    expect(set.fails).toBe(false);
  });

  it("described, unread, blank, .optional() → documented, NOT an error", () => {
    const list = mk().check.environment({
      requirements: [],
      environment: v.environment({ SECRET_VIVA_DEEPGRAM_API_KEY: v.string().desc("d").optional() }),
    });
    expect(list[0].verdict).toBe("documented");
    expect(list.fails).toBe(false);
  });

  it("a documented row carries its VALUE — which is how the wizard knows what is still owed", () => {
    const paladin = mk({ VIVA_SET: "yes" });
    const rows = rowsOf(paladin, [], v.environment({
      VIVA_SET: v.string().desc("s"),
      VIVA_MISSING: v.string().desc("m").optional(),
    }));
    expect(rows.VIVA_SET.value).toBe("yes");
    expect(rows.VIVA_SET.stratum).toBe("flag");
    expect(rows.VIVA_MISSING.value).toBe(null);
  });

  it("a secret is reported as PRESENT, never as itself", () => {
    const set = rowsOf(mk({}, { SECRET_VIVA_JWT: "sk-live-do-not-print-but-long-enough" }), [], v.environment({
      SECRET_VIVA_JWT: v.string().desc("jwt"),
    }));
    expect(set.SECRET_VIVA_JWT.value).toBe("***");
    expect(JSON.stringify(set).includes("sk-live")).toBe(false);
    const absent = rowsOf(mk(), [], v.environment({ SECRET_VIVA_JWT: v.string().desc("jwt") }));
    expect(absent.SECRET_VIVA_JWT.value).toBe(null);
  });

  it("a secret read by a thunk carries its at, and being unset makes it REQUIRED", () => {
    const rows = rowsOf(
      mk(),
      [{ at: "service[lh].secrets.jwt", read: ["SECRET_VIVA_JWT"], unset: ["SECRET_VIVA_JWT"] }],
      v.environment({ SECRET_VIVA_JWT: v.string().desc("jwt") }),
    );
    expect(rows.SECRET_VIVA_JWT.at).toBe("service[lh].secrets.jwt");
    expect(rows.SECRET_VIVA_JWT.value).toBe(null);
    expect(rows.SECRET_VIVA_JWT.verdict).toBe("REQUIRED");
  });

  it("one key read from several places yields one row per site — that IS the per-consumer set", () => {
    const list = mk({ PUBLIC_VIVA_LH: "http://x" }).check.environment({
      requirements: [
        read("clients.kajuit.lighthouse.remote", "PUBLIC_VIVA_LH"),
        read("daemon[education].lighthouse.remote", "PUBLIC_VIVA_LH"),
      ],
      environment: v.environment({ PUBLIC_VIVA_LH: v.url().desc("lh") }),
    });
    expect(list.length).toBe(2);
    expect(list.map((row) => row.at)).toEqual([
      "clients.kajuit.lighthouse.remote",
      "daemon[education].lighthouse.remote",
    ]);
    expect(list.every((row) => row.verdict === "ok")).toBe(true);
  });

  it("a thunk reading several keys yields a row for each", () => {
    const list = mk({ VIVA_A: "1", VIVA_B: "2" }).check.environment({
      requirements: [{ at: "runtime.serve", read: ["VIVA_A", "VIVA_B"], unset: [] }],
      environment: v.environment({ VIVA_A: v.string().desc("a"), VIVA_B: v.string().desc("b") }),
    });
    expect(list.map((row) => row.key)).toEqual(["VIVA_A", "VIVA_B"]);
  });

  it("no schema and no requirements is empty and clean, not a failure", () => {
    const list = mk().check.environment({ requirements: [], environment: v.environment({}) });
    expect(list.length).toBe(0);
    expect(list.fails).toBe(false);
  });

  it("tolerates an instance with neither field — a declaration may carry no environment at all", () => {
    const list = mk().check.environment({});
    expect(list.length).toBe(0);
    expect(list.fails).toBe(false);
  });

  it("a string that converts to the declared type is ok — a .env holds strings, the schema holds types", () => {
    const rows = rowsOf(mk({ VIVA_PORT: "8080" }), [read("service.port", "VIVA_PORT")], v.environment({
      VIVA_PORT: v.integer().desc("port"),
    }));
    expect(rows.VIVA_PORT.verdict).toBe("ok");
    expect(rows.VIVA_PORT.value).toBe("8080");
    const bad = rowsOf(mk({ VIVA_PORT: "eighty" }), [read("service.port", "VIVA_PORT")], v.environment({
      VIVA_PORT: v.integer().desc("port"),
    }));
    expect(bad.VIVA_PORT.verdict).toBe("INVALID");
  });

  it("the wrong-list is published once, for doctor and init to read", () => {
    expect(mk().check.wrong).toEqual(["UNDOCUMENTED", "REQUIRED", "INVALID"]);
  });
});
