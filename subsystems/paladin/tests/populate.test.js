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

  it("tails: sessions/<VIVA_PROCESS_ID>.json → @session · environment.json → @ledger · no shell → no session", async () => {
    const home = await Deno.makeTempDir();
    await Deno.mkdir(`${home}/sessions`, { recursive: true });
    await Deno.writeTextFile(
      `${home}/sessions/424242.json`,
      JSON.stringify({ VIVA_PROBE_SESSION: "shell" }),
    );
    await Deno.writeTextFile(
      `${home}/environment.json`,
      JSON.stringify({ VIVA_PROBE_LEDGER: "machine" }),
    );
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

  it("divergence regression: environment scope resolves through paladin.env, not Deno.env", async () => {
    const home = await Deno.makeTempDir();
    await scrubbed({ VIVA_ENVIRONMENT_MOUNT: null }, async () => {
      const paladin = mkScoped(home);
      paladin.env.set("VIVA_ENVIRONMENT_MOUNT", `${home}/custom-environment`, "flag");
      await populate.scopes(paladin);
      expect(paladin.scope.environment.absolute).toBe(`${home}/custom-environment`);
    });
  });
});
