import { specimen } from "@vivalence/typology";
import { credentials } from "../../dom/credentials.js";

const ORIGIN = "http://localhost:2501";

const storage = () => {
  const held = new Map();
  return {
    held,
    getItem: (key) => (held.has(key) ? held.get(key) : null),
    setItem: (key, value) => held.set(key, String(value)),
    removeItem: (key) => held.delete(key),
  };
};

const record = () => ({
  user: { id: "user-1", slug: "beef" },
  authority: { access: "eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl", refresh: "eyJhbGciOi.eyJyZWZyZXNo.c2lnbmF0dXJl" },
  at: "2026-10-10T21:03:24.000Z",
});

specimen.describe("dom credentials — a lighthouse record per origin over a Storage", () => {
  specimen.it("reads null when nothing is stored", () => {
    specimen.expect(credentials(storage()).read(ORIGIN)).toBe(null);
  });

  specimen.it("writes under lighthouse:<origin> and reads the same record back", () => {
    const held = storage();
    const carrier = credentials(held);
    carrier.write(ORIGIN, record());
    specimen.expect([...held.held.keys()]).toEqual([`lighthouse:${ORIGIN}`]);
    specimen.expect(carrier.read(ORIGIN)).toEqual(record());
  });

  specimen.it("keeps origins apart", () => {
    const carrier = credentials(storage());
    carrier.write(ORIGIN, record());
    specimen.expect(carrier.read("https://vivalence.org")).toBe(null);
    specimen.expect(carrier.read(ORIGIN)).toEqual(record());
  });

  specimen.it("clears an origin", () => {
    const held = storage();
    const carrier = credentials(held);
    carrier.write(ORIGIN, record());
    carrier.clear(ORIGIN);
    specimen.expect(carrier.read(ORIGIN)).toBe(null);
    specimen.expect(held.held.size).toBe(0);
  });

  specimen.it("removes unparseable text and reads null", () => {
    const held = storage();
    held.setItem(`lighthouse:${ORIGIN}`, "{not json");
    specimen.expect(credentials(held).read(ORIGIN)).toBe(null);
    specimen.expect(held.held.size).toBe(0);
  });

  specimen.it("removes a record that fails the Credential schematic and reads null", () => {
    const MALFORMED = [
      { user: { id: 1 }, authority: record().authority, at: record().at },
      { ...record(), extra: true },
      { ...record(), authority: { access: "x", refresh: "y" } },
      null,
      [],
    ];
    for (const malformed of MALFORMED) {
      const held = storage();
      held.setItem(`lighthouse:${ORIGIN}`, JSON.stringify(malformed));
      specimen.expect(credentials(held).read(ORIGIN)).toBe(null);
      specimen.expect(held.held.size).toBe(0);
    }
  });

  specimen.it("refuses to write a malformed record, naming the faults and never the tokens", () => {
    const held = storage();
    const secret = { ...record(), authority: { access: "secret-access", refresh: "secret-refresh" } };
    specimen.expect(() => credentials(held).write(ORIGIN, secret)).toThrow(/authority\/access/);
    try {
      credentials(held).write(ORIGIN, secret);
    } catch (error) {
      specimen.expect(error.message.includes("secret-access")).toBe(false);
    }
    specimen.expect(held.held.size).toBe(0);
  });
});
