// upsert by line, because a .env is authored: comments and ordering are content.
import { specimen } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const { describe, it, expect } = specimen;
const tmp = async (body = "") => {
  const file = `${await Deno.makeTempDir()}/.env`;
  if (body) await Deno.writeTextFile(file, body);
  return file;
};

describe("state.env", () => {
  it("creates the file when absent", async () => {
    const file = `${await Deno.makeTempDir()}/nested/.env`;
    await paladin.state.env(file, { VIVA_A: "1" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_A="1"\n');
  });

  it("replaces a value IN PLACE, keeping comments, blanks and order", async () => {
    const file = await tmp('# addresses\nVIVA_A="old"\n\n# keys\nSECRET_VIVA_B=""\n');
    await paladin.state.env(file, { VIVA_A: "new" });
    expect(await Deno.readTextFile(file)).toBe('# addresses\nVIVA_A="new"\n\n# keys\nSECRET_VIVA_B=""\n');
  });

  it("appends a key it has never seen, after the existing content", async () => {
    const file = await tmp('# top\nVIVA_A="1"\n');
    await paladin.state.env(file, { VIVA_B: "2" });
    expect(await Deno.readTextFile(file)).toBe('# top\nVIVA_A="1"\nVIVA_B="2"\n');
  });

  it("writes several keys in one pass, replacing and appending as needed", async () => {
    const file = await tmp('VIVA_A="1"\n');
    await paladin.state.env(file, { VIVA_A: "9", VIVA_B: "2" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_A="9"\nVIVA_B="2"\n');
  });

  it("matches an exported line and rewrites it in the same shape", async () => {
    const file = await tmp('export VIVA_A="old"\n');
    await paladin.state.env(file, { VIVA_A: "new" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_A="new"\n');
  });

  it("does not match a key that merely PREFIXES another", async () => {
    const file = await tmp('VIVA_A_LONGER="keep"\n');
    await paladin.state.env(file, { VIVA_A: "new" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_A_LONGER="keep"\nVIVA_A="new"\n');
  });

  it("does not disturb a commented-out line of the same key", async () => {
    const file = await tmp('# VIVA_A="disabled"\nVIVA_B="1"\n');
    await paladin.state.env(file, { VIVA_A: "on" });
    expect(await Deno.readTextFile(file)).toBe('# VIVA_A="disabled"\nVIVA_B="1"\nVIVA_A="on"\n');
  });

  it("keeps a ${VAR} reference verbatim — expansion is Env.get's job, not the writer's", async () => {
    const file = await tmp();
    await paladin.state.env(file, { VIVA_SERVE: "${VIVA_ORIGIN}/" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_SERVE="${VIVA_ORIGIN}/"\n');
  });

  it("is idempotent — writing the same bag twice changes nothing", async () => {
    const file = await tmp('# c\nVIVA_A="1"\n');
    await paladin.state.env(file, { VIVA_A: "2" });
    const once = await Deno.readTextFile(file);
    await paladin.state.env(file, { VIVA_A: "2" });
    expect(await Deno.readTextFile(file)).toBe(once);
  });

  it("normalises a missing trailing newline before appending", async () => {
    const file = await tmp('VIVA_A="1"');
    await paladin.state.env(file, { VIVA_B: "2" });
    expect(await Deno.readTextFile(file)).toBe('VIVA_A="1"\nVIVA_B="2"\n');
  });
});

describe("publish", () => {
  it("publishes the EXPANDED value — the receiving process cannot expand ${VAR} itself", () => {
    paladin.env.assign(
      { VIVA_PROBE_ORIGIN: "http://localhost:2501", PUBLIC_VIVA_PROBE_REMOTE: "${VIVA_PROBE_ORIGIN}/x" },
      "flag",
    );
    paladin.publish();
    expect(Deno.env.get("PUBLIC_VIVA_PROBE_REMOTE")).toBe("http://localhost:2501/x");
    expect(paladin.env.vars.PUBLIC_VIVA_PROBE_REMOTE).toBe("${VIVA_PROBE_ORIGIN}/x");
    Deno.env.delete("PUBLIC_VIVA_PROBE_REMOTE");
    paladin.env.delete("PUBLIC_VIVA_PROBE_REMOTE");
    paladin.env.delete("VIVA_PROBE_ORIGIN");
  });
});
