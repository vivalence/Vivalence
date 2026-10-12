import * as kit from "../../chrome/index.js";
import { specimen } from "@vivalence/typology";

const record = (slug) => ({
  user: { id: `id-${slug}`, slug },
  authority: { access: "header.payload.signature", refresh: "header.payload.refresh" },
  at: "2026-10-10T21:03:24.000Z",
});

const home = () => `${Deno.makeTempDirSync({ prefix: "tty-credentials-" })}/credentials.json`;

specimen.describe("credentials(file) — one 0600 JSON keyed by origin", () => {
  specimen.it("reads null from a file that is not there yet", () => {
    specimen.expect(kit.credentials(home()).read("http://localhost:2501")).toBe(null);
  });

  specimen.it("writes a record and reads it back", () => {
    const store = kit.credentials(home());
    store.write("http://localhost:2501", record("beef"));
    specimen.expect(store.read("http://localhost:2501")).toEqual(record("beef"));
  });

  specimen.it("holds the file at mode 0600, after a write and after a clear", () => {
    const file = home();
    const store = kit.credentials(file);
    store.write("http://localhost:2501", record("beef"));
    specimen.expect(Deno.statSync(file).mode & 0o777).toBe(0o600);
    Deno.chmodSync(file, 0o644);
    store.clear("http://localhost:2501");
    specimen.expect(Deno.statSync(file).mode & 0o777).toBe(0o600);
  });

  specimen.it("never mixes two origins", () => {
    const store = kit.credentials(home());
    store.write("http://localhost:2501", record("beef"));
    store.write("https://vivalence.org", record("finn"));
    specimen.expect(store.read("http://localhost:2501").user.slug).toBe("beef");
    specimen.expect(store.read("https://vivalence.org").user.slug).toBe("finn");
    store.clear("http://localhost:2501");
    specimen.expect(store.read("http://localhost:2501")).toBe(null);
    specimen.expect(store.read("https://vivalence.org")).toEqual(record("finn"));
  });

  specimen.it("a second store over the same file reads what the first wrote", () => {
    const file = home();
    kit.credentials(file).write("http://localhost:2501", record("beef"));
    specimen.expect(kit.credentials(file).read("http://localhost:2501")).toEqual(record("beef"));
    specimen.expect(JSON.parse(Deno.readTextFileSync(file))).toEqual({ "http://localhost:2501": record("beef") });
  });

  specimen.it("refuses a record that is not a Credential, naming paths and never the values", () => {
    const store = kit.credentials(home());
    const broken = { ...record("beef"), authority: { access: "secret-token-value" } };
    specimen.expect(() => store.write("http://localhost:2501", broken)).toThrow(/not a Credential/);
    try {
      store.write("http://localhost:2501", broken);
    } catch (error) {
      specimen.expect(error.message).not.toContain("secret-token-value");
    }
    specimen.expect(store.read("http://localhost:2501")).toBe(null);
  });
});
