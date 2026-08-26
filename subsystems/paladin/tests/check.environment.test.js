// authored schema against observed record. only two things are ever wrong: undocumented, required.
import { specimen } from "@vivalence/typology";
import { Paladin } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;
const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];

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
const read = (at, key, extra = {}) => ({ at, read: [key], unset: [], usable: true, ...extra });

describe("check.environment", () => {
  it("described and set → ok", () => {
    const rows = rowsOf(mk({ VIVA_A: "1" }), [read("runtime.serve", "VIVA_A")], {
      VIVA_A: { describe: "a", group: "addresses" },
    });
    expect(rows.VIVA_A.verdict).toBe("ok");
    expect(rows.VIVA_A.at).toBe("runtime.serve");
    expect(rows.VIVA_A.describe).toBe("a");
    expect(rows.VIVA_A.group).toBe("addresses");
  });

  it("read by a thunk but described nowhere → UNDOCUMENTED, and it FAILS", () => {
    const list = mk({ VIVA_A: "1" }).check.environment({
      requirements: [read("runtime.serve", "VIVA_A")],
      environment: {},
    });
    expect(list[0].verdict).toBe("UNDOCUMENTED");
    expect(list.fails).toBe(true);
  });

  it("unset and unusable → REQUIRED, and it FAILS", () => {
    const list = mk().check.environment({
      requirements: [{ at: "runtime.serve", read: ["VIVA_A"], unset: ["VIVA_A"], usable: false }],
      environment: { VIVA_A: { describe: "a" } },
    });
    expect(list[0].verdict).toBe("REQUIRED");
    expect(list.fails).toBe(true);
  });

  it("unset but the declaration COPED → optional, and it does not fail", () => {
    // the only shape that produces this: () => paladin.env.get(K) ?? "a-default"
    const list = mk().check.environment({
      requirements: [{ at: "runtime.serve", read: ["VIVA_A"], unset: ["VIVA_A"], usable: true }],
      environment: { VIVA_A: { describe: "a" } },
    });
    expect(list[0].verdict).toBe("optional");
    expect(list.fails).toBe(false);
  });

  it("described but no thunk read it → documented, NOT an error", () => {
    // three of hello-world's fifteen are like this: the browser bundle and a docker container
    // read them. the old UNREAD verdict was wrong 20% of the time on the first instance tried.
    const list = mk({ PUBLIC_VIVA_RUNTIME_REMOTE: "http://x" }).check.environment({
      requirements: [],
      environment: { PUBLIC_VIVA_RUNTIME_REMOTE: { describe: "the browser calls this" } },
    });
    expect(list[0].verdict).toBe("documented");
    expect(list[0].at).toBe(null);
    expect(list.fails).toBe(false);
  });

  it("a documented row carries its VALUE — which is how the wizard knows what is still owed", () => {
    const paladin = mk({ VIVA_SET: "yes" });
    const rows = rowsOf(paladin, [], {
      VIVA_SET: { describe: "s" },
      VIVA_MISSING: { describe: "m" },
    });
    expect(rows.VIVA_SET.value).toBe("yes");
    expect(rows.VIVA_SET.stratum).toBe("flag");
    expect(rows.VIVA_MISSING.value).toBe(null);
  });

  it("a secret is reported as PRESENT, never as itself", () => {
    const set = rowsOf(mk({}, { SECRET_VIVA_JWT: "sk-live-do-not-print" }), [], {
      SECRET_VIVA_JWT: { describe: "jwt" },
    });
    expect(set.SECRET_VIVA_JWT.value).toBe("***");
    expect(JSON.stringify(set).includes("sk-live")).toBe(false);
    const absent = rowsOf(mk(), [], { SECRET_VIVA_JWT: { describe: "jwt" } });
    expect(absent.SECRET_VIVA_JWT.value).toBe(null);
  });

  it("a secret read by a thunk carries its at, and being unset makes it REQUIRED", () => {
    const rows = rowsOf(
      mk(),
      [{ at: "service[lh].secrets.jwt", read: ["SECRET_VIVA_JWT"], unset: ["SECRET_VIVA_JWT"], usable: false, deferred: true }],
      { SECRET_VIVA_JWT: { describe: "jwt" } },
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
      environment: { PUBLIC_VIVA_LH: { describe: "lh" } },
    });
    expect(list.length).toBe(2);
    expect(list.map((row) => row.at)).toEqual([
      "clients.kajuit.lighthouse.remote",
      "daemon[education].lighthouse.remote",
    ]);
  });

  it("a thunk reading several keys yields a row for each", () => {
    const list = mk({ VIVA_A: "1", VIVA_B: "2" }).check.environment({
      requirements: [{ at: "runtime.serve", read: ["VIVA_A", "VIVA_B"], unset: [], usable: true }],
      environment: { VIVA_A: { describe: "a" }, VIVA_B: { describe: "b" } },
    });
    expect(list.map((row) => row.key)).toEqual(["VIVA_A", "VIVA_B"]);
  });

  it("no schema and no requirements is empty and clean, not a failure", () => {
    const list = mk().check.environment({ requirements: [], environment: {} });
    expect(list.length).toBe(0);
    expect(list.fails).toBe(false);
  });

  it("tolerates an instance with neither field — a declaration may carry no environment at all", () => {
    const list = mk().check.environment({});
    expect(list.length).toBe(0);
    expect(list.fails).toBe(false);
  });
});
