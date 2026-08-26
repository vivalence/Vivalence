import { specimen } from "@vivalence/typology";
import { Paladin, populate } from "@vivalence/paladin/typology";

const { describe, it, expect } = specimen;

async function scrubbed(pairs, body) {
  const held = {};
  for (const [key, value] of Object.entries(pairs)) {
    held[key] = Deno.env.get(key) ?? null;
    if (value === null) Deno.env.delete(key);
    else Deno.env.set(key, value);
  }
  try {
    return await body();
  } finally {
    for (const [key, value] of Object.entries(held)) {
      if (value === null) Deno.env.delete(key);
      else Deno.env.set(key, value);
    }
  }
}

function mkScoped(home) {
  const paladin = new Paladin();
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  paladin.env.set("VIVA_LEDGER_MOUNT", home);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", home);
  return paladin;
}

describe("populate — binding: each channel lands in its declared stratum", () => {
  it("os: VIVA_/PUBLIC_VIVA_ → env@os · SECRET_VIVA_ → secret@os · junk → neither", async () => {
    const empty = await Deno.makeTempDir();
    await scrubbed(
      {
        INIT_CWD: empty,
        VIVA_ENV_FILE: null,
        VIVA_PROBE_OS: "a",
        PUBLIC_VIVA_PROBE_OS: "b",
        SECRET_VIVA_PROBE_OS: "c",
        PROBE_JUNK: "d",
      },
      async () => {
        const paladin = new Paladin();
        await populate.env(paladin);
        expect(paladin.env.provenance("VIVA_PROBE_OS")).toBe("os");
        expect(paladin.env.provenance("PUBLIC_VIVA_PROBE_OS")).toBe("os");
        expect(paladin.secret.provenance("SECRET_VIVA_PROBE_OS")).toBe("os");
        expect(paladin.env.has("SECRET_VIVA_PROBE_OS")).toBe(false);
        expect(paladin.env.has("PROBE_JUNK")).toBe(false);
        expect(paladin.secret.has("PROBE_JUNK")).toBe(false);
      },
    );
  });

  it("./ scan: a cwd .env lands @.env, filtered and split; absence is silent", async () => {
    const dir = await Deno.makeTempDir();
    await Deno.writeTextFile(
      `${dir}/.env`,
      "VIVA_PROBE_SCAN=hit\nSECRET_VIVA_PROBE_SCAN=shh\nPROBE_SCAN_JUNK=no\n",
    );
    await scrubbed({ INIT_CWD: dir, VIVA_ENV_FILE: null }, async () => {
      const paladin = new Paladin();
      await populate.env(paladin);
      expect(paladin.env.get("VIVA_PROBE_SCAN")).toBe("hit");
      expect(paladin.env.provenance("VIVA_PROBE_SCAN")).toBe(".env");
      expect(paladin.secret.provenance("SECRET_VIVA_PROBE_SCAN")).toBe(".env");
      expect(paladin.env.has("PROBE_SCAN_JUNK")).toBe(false);
    });
    const bare = await Deno.makeTempDir();
    await scrubbed({ INIT_CWD: bare, VIVA_ENV_FILE: null }, async () => {
      await populate.env(new Paladin());
    });
  });

  it("VIVA_ENV_FILE: filtered+split @.env · knowledge-free throws · secrets-only passes", async () => {
    const dir = await Deno.makeTempDir();
    await Deno.writeTextFile(`${dir}/knowledge.env`, "VIVA_PROBE_FILE=yes\n");
    await Deno.writeTextFile(`${dir}/hollow.env`, "NOTHING=here\n");
    await Deno.writeTextFile(`${dir}/dark.env`, "SECRET_VIVA_PROBE_FILE=shh\n");
    await scrubbed({ INIT_CWD: dir, VIVA_ENV_FILE: `${dir}/knowledge.env` }, async () => {
      const paladin = new Paladin();
      await populate.env(paladin);
      expect(paladin.env.provenance("VIVA_PROBE_FILE")).toBe(".env");
    });
    await scrubbed({ INIT_CWD: dir, VIVA_ENV_FILE: `${dir}/hollow.env` }, async () => {
      let thrown = null;
      try {
        await populate.env(new Paladin());
      } catch (error) {
        thrown = error;
      }
      expect(String(thrown)).toContain("no VIVA_* knowledge");
    });
    await scrubbed({ INIT_CWD: dir, VIVA_ENV_FILE: `${dir}/dark.env` }, async () => {
      const paladin = new Paladin();
      await populate.env(paladin);
      expect(paladin.secret.provenance("SECRET_VIVA_PROBE_FILE")).toBe(".env");
    });
  });

  it("tails: sessions/<pid>.json → @session · <ledger>/.env → @ledger · no shell → no session", async () => {
    const home = await Deno.makeTempDir();
    await Deno.mkdir(`${home}/sessions`, { recursive: true });
    await Deno.writeTextFile(
      `${home}/sessions/424242.json`,
      JSON.stringify({ VIVA_PROBE_SESSION: "shell" }),
    );
    // the ledger's env is a .env now — authored, comment-bearing, never machine-rewritten
    await Deno.writeTextFile(`${home}/.env`, "VIVA_PROBE_LEDGER=machine\n");
    await scrubbed({ VIVA_PROCESS_ID: "424242" }, async () => {
      const paladin = mkScoped(home);
      await populate.scopes(paladin);
      expect(paladin.env.get("VIVA_PROBE_SESSION")).toBe("shell");
      expect(paladin.env.provenance("VIVA_PROBE_SESSION")).toBe("session");
      expect(paladin.env.provenance("VIVA_PROBE_LEDGER")).toBe("ledger");
    });
    await scrubbed({ VIVA_PROCESS_ID: null }, async () => {
      const paladin = mkScoped(home);
      await populate.scopes(paladin);
      expect(paladin.env.has("VIVA_PROBE_SESSION")).toBe(false);
      expect(paladin.env.provenance("VIVA_PROBE_LEDGER")).toBe("ledger");
    });
  });

  it("a SECRET_* in a session record goes to the SECRET bag, not the env one", async () => {
    // both tails used to call paladin.env.assign directly — the whole bag into the env store with
    // no key split at all, where ledger/doctor prints values. filename-independent, and live.
    const home = await Deno.makeTempDir();
    await Deno.mkdir(`${home}/sessions`, { recursive: true });
    await Deno.writeTextFile(
      `${home}/sessions/424243.json`,
      JSON.stringify({ VIVA_PROBE_OPEN: "public", SECRET_VIVA_PROBE_DARK: "shh", NOISE: "dropped" }),
    );
    await scrubbed({ VIVA_PROCESS_ID: "424243" }, async () => {
      const paladin = mkScoped(home);
      await populate.scopes(paladin);
      expect(paladin.env.get("VIVA_PROBE_OPEN")).toBe("public");
      expect(paladin.env.has("SECRET_VIVA_PROBE_DARK")).toBe(false);
      expect(paladin.secret.get("SECRET_VIVA_PROBE_DARK")).toBe("shh");
      expect(paladin.secret.provenance("SECRET_VIVA_PROBE_DARK")).toBe("session");
      // a key in no namespace is ignored entirely, wherever it was written
      expect(paladin.env.has("NOISE")).toBe(false);
    });
  });

  it("standing in the ledger does not promote its .env above the session that selected an instance", async () => {
    // the ambient/role split, end to end: the cwd scan reads <ledger>/.env at rank 4, then the
    // ledger claims the same file at rank 7 and evicts the accident. without that, `cd ~/.viva`
    // silently changes which instance you are on.
    const home = await Deno.makeTempDir();
    await Deno.mkdir(`${home}/sessions`, { recursive: true });
    await Deno.writeTextFile(`${home}/.env`, 'VIVA_INSTANCE_MOUNT="/instances/from-ledger"\n');
    await Deno.writeTextFile(
      `${home}/sessions/424244.json`,
      JSON.stringify({ VIVA_INSTANCE_MOUNT: "/instances/from-session" }),
    );
    await scrubbed({ INIT_CWD: home, VIVA_PROCESS_ID: "424244" }, async () => {
      const paladin = mkScoped(home);
      await populate.env(paladin);
      // the ambient reading is there, and on its own it would win
      expect(paladin.env.provenance("VIVA_INSTANCE_MOUNT")).toBe(".env");
      await populate.scopes(paladin);
      expect(paladin.env.provenance("VIVA_INSTANCE_MOUNT")).toBe("session");
      expect(paladin.env.get("VIVA_INSTANCE_MOUNT")).toBe("/instances/from-session");
      // and the file contributes exactly once, at the stratum that owns it
      expect(paladin.env.strati("VIVA_INSTANCE_MOUNT").map((row) => row.stratum)).toEqual([
        "session",
        "ledger",
      ]);
    });
  });

  // `environment` is no longer a scope — an instance's environment.json sits beside its .env,
  // at the instance root. the divergence this used to guard (resolving through Deno.env instead
  // of paladin.env) is still pinned by the mountpoint scope, which resolves the same way.
  it("divergence regression: mountpoint scope resolves through paladin.env, not Deno.env", async () => {
    const home = await Deno.makeTempDir();
    await scrubbed({ VIVA_MOUNTPOINT_MOUNT: null }, async () => {
      const paladin = mkScoped(home);
      paladin.env.set("VIVA_MOUNTPOINT_MOUNT", `${home}/custom-mountpoint`, "flag");
      await populate.scopes(paladin);
      expect(paladin.scope.mountpoint.absolute).toBe(`${home}/custom-mountpoint`);
    });
  });

  it("a KEY decides secrecy — never the file it arrived in", async () => {
    const paladin = mkScoped(await Deno.makeTempDir());
    const { held, secrets, ignored } = paladin.assign(
      {
        VIVA_A: "1",
        PUBLIC_VIVA_B: "2",
        SECRET_VIVA_C: "3",
        SECRET_D: "4",
        UNRELATED: "5",
      },
      "instance",
    );
    expect(Object.keys(held).sort()).toEqual(["PUBLIC_VIVA_B", "VIVA_A"]);
    expect(Object.keys(secrets).sort()).toEqual(["SECRET_D", "SECRET_VIVA_C"]);
    expect(ignored).toEqual(["UNRELATED"]);
    expect(paladin.env.has("SECRET_VIVA_C")).toBe(false);
    expect(paladin.secret.get("SECRET_VIVA_C")).toBe("3");
  });
});
