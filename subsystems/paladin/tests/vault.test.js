import { specimen } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { FULL } from "../gestalten/belt/index.js";
import { belt, scopes } from "../paladin/lifecycle.js";
import { twin } from "./scenarios/twin.js";

const { describe, it, expect } = specimen;

const ORIGIN = "http://lighthouse.probe";
const RECORD = { user: { id: "u1" }, authority: "token", at: "2026-10-21T00:00:00.000Z" };

const fresh = async (flags = {}) => {
  const home = await Deno.makeTempDir({ prefix: "viva-vault-" });
  const paladin = belt(new Paladin(), FULL);
  paladin.assign({ VIVA_LEDGER_MOUNT: home, ...flags }, "flag");
  await scopes(paladin);
  return { paladin, home };
};

const without = (name, run) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  delete globalThis[name];
  try {
    return run();
  } finally {
    Object.defineProperty(globalThis, name, descriptor);
  }
};

const exists = (path) => Deno.stat(path).then(() => true, () => false);

describe("belt/vault — one slot, the backend resolved at first call", () => {
  it("under Deno the file backend: an unknown origin is null; a store is held back; the file is the credentials scope at mode 0600; a null store removes the row", async () => {
    const { paladin, home } = await fresh();
    expect(paladin.scope.credentials.absolute).toBe(`${home}/credentials.json`);
    expect(paladin.vault.held(ORIGIN)).toBe(null);
    expect(await exists(`${home}/credentials.json`)).toBe(false);
    paladin.vault.store(ORIGIN, RECORD);
    expect(paladin.vault.held(ORIGIN)).toEqual(RECORD);
    expect((await Deno.stat(`${home}/credentials.json`)).mode & 0o777).toBe(0o600);
    expect(JSON.parse(await Deno.readTextFile(`${home}/credentials.json`))).toEqual({ [ORIGIN]: RECORD });
    paladin.vault.store("http://other", { user: null, authority: "b", at: "x" });
    paladin.vault.store(ORIGIN, null);
    expect(paladin.vault.held(ORIGIN)).toBe(null);
    expect(Object.keys(JSON.parse(await Deno.readTextFile(`${home}/credentials.json`)))).toEqual(["http://other"]);
  });

  it("VIVA_CLIENT_GHOST_CREDENTIALS_FILE moves the file; paladin.files declares the key beside paladin.mounts", async () => {
    const home = await Deno.makeTempDir({ prefix: "viva-vault-file-" });
    const { paladin } = await fresh({ VIVA_CLIENT_GHOST_CREDENTIALS_FILE: `${home}/missing/dir/elsewhere.json` });
    expect(Object.keys(paladin.files.properties)).toEqual(["VIVA_CLIENT_GHOST_CREDENTIALS_FILE"]);
    expect(Object.keys(paladin.mounts.properties)).toContain("VIVA_LEDGER_MOUNT");
    expect(paladin.scope.credentials.absolute).toBe(`${home}/missing/dir/elsewhere.json`);
    paladin.vault.store(ORIGIN, RECORD);
    expect(JSON.parse(await Deno.readTextFile(`${home}/missing/dir/elsewhere.json`))).toEqual({ [ORIGIN]: RECORD });
  });

  it("the slot resolves once: resolved without Deno it is localStorage, and stays so after Deno returns — no file is written", async () => {
    const { paladin, home } = await fresh();
    const store = new Map();
    const storage = { getItem: (key) => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, String(value)), removeItem: (key) => store.delete(key) };
    const kept = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
    try {
      expect(without("Deno", () => paladin.vault.held(ORIGIN))).toBe(null);
      paladin.vault.store(ORIGIN, RECORD);
      expect([...store.keys()]).toEqual([`vault:${ORIGIN}`]);
      expect(paladin.vault.held(ORIGIN)).toEqual(RECORD);
      paladin.vault.store(ORIGIN, null);
      expect([...store.keys()]).toEqual([]);
      expect(paladin.vault.held(ORIGIN)).toBe(null);
    } finally {
      Object.defineProperty(globalThis, "localStorage", kept);
    }
    expect(await exists(`${home}/credentials.json`)).toBe(false);
  });

  it("no Deno and no localStorage is loud, and the slot stays empty for the next call", async () => {
    const { paladin } = await fresh();
    expect(() => without("Deno", () => without("localStorage", () => paladin.vault.held(ORIGIN)))).toThrow("[vault] no backend");
    expect(paladin.vault.held(ORIGIN)).toBe(null);
  });
});

describe("mod.client.js — the browser twin of mod.js", { sanitizeOps: false, sanitizeResources: false }, () => {
  it("loads under a DOM-ish global with Deno gone: vault on localStorage, the baked instance and env, one memoized factory, wire from the baked modes, no fs", async () => {
    const twinned = await twin();
    expect(twinned.deno).toBe(false);
    expect(twinned.document).toBe("function");
    expect(twinned.before).toBe(null);
    expect(twinned.after).toEqual({ user: { id: "u1" }, authority: "token" });
    expect(twinned.stored).toEqual(["vault:http://lighthouse.probe"]);
    expect(twinned.removed).toBe(null);
    expect(twinned.memoized).toBe(true);
    expect(twinned.instance).toBe(true);
    expect(twinned.slug).toBe("twin");
    expect(twinned.clients).toEqual(["ghost"]);
    expect(twinned.env).toBe("twin");
    expect(twinned.modes).toEqual([["console", "@probe"]]);
    expect(twinned.hallucinators).toEqual([]);
    expect(twinned.remote).toBe("http://localhost:2501");
    expect(twinned.reference).toBe("/client/ghost");
    expect(await exists(`${twinned.home}/.viva`)).toBe(false);
    expect(await exists(`${twinned.home}/credentials.json`)).toBe(false);
  });
});
