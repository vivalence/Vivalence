import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { v } from "@vivalence/typology";

const { Credential, Credentials } = v.primitives.credentials;

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjQyIiwidHlwZSI6ImFjY2VzcyJ9.c2ln";
const row = (held = {}) => ({
  user: { id: "42", slug: "finn", traits: [], trait: {} },
  authority: { access: TOKEN, refresh: TOKEN },
  at: "2026-10-10T21:03:24.000Z",
  ...held,
});
const sentences = (schema, value) => schema.faults(value).map(({ at, reason }) => `${at} ${reason}`);

describe("v.primitives.credentials — one record, keyed by lighthouse origin", () => {
  it("a row is the user card, both tokens and the moment — nothing else", () => {
    expect(sentences(Credential, row())).toEqual([]);
    expect(sentences(Credential, row({ password: "hunter22" }))).toEqual(["/ must not have additional properties"]);
    expect(sentences(Credential, row({ authority: { access: "not-a-jwt", refresh: TOKEN } })).map((line) => line.split(" ")[0])).toEqual(["/authority/access"]);
    expect(sentences(Credential, { user: { id: "42", slug: "finn", traits: [], trait: {} }, authority: { access: TOKEN, refresh: TOKEN } }).map((line) => line.split(" ")[0])).toEqual(["/"]);
  });

  it("the record holds many lighthouses, one row each, by origin", () => {
    const record = { "http://localhost:2501": row(), "https://runtime.vivalence.com": row({ user: { id: "7", slug: "beef", traits: [], trait: {} } }) };
    expect(sentences(Credentials, record)).toEqual([]);
    expect(sentences(Credentials, {})).toEqual([]);
    expect(sentences(Credentials, { "http://localhost:2501": { authority: row().authority } }).map((line) => line.split(" ")[0])).toEqual(["/http://localhost:2501"]);
  });
});
