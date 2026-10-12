import paladin from "@vivalence/paladin";
import { Path, specimen } from "@vivalence/typology";
import { drive } from "./verb.js";

const { describe, it, beforeEach, expect } = specimen;

describe("viva instance/tap — a hand-placed instance dir into the record", () => {
  let ledger;

  beforeEach(async () => {
    ledger = await Deno.makeTempDir({ prefix: "ghost-tap-ledger-" });
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
    paladin.scopes([["ledger", () => true, () => new Path(ledger)]]);
  });

  it("path and --slug are both required", async () => {
    await expect(drive(["instance/tap", "/somewhere"])).rejects.toThrow("usage: viva instance/tap <path> --slug=<slug>");
  });

  it("a bare token is refused — a tap takes a PATH", async () => {
    await expect(drive(["instance/tap", "somedir", "--slug=x"])).rejects.toThrow("try ./somedir");
  });

  it("a real dir lands in the record under the given slug", async () => {
    const mount = await Deno.makeTempDir({ suffix: "-adopted" });
    expect(await drive(["instance/tap", mount, "--slug=adopted"])).toEqual({ tapped: "adopted", mount });
    const record = JSON.parse(await Deno.readTextFile(`${ledger}/instances.json`));
    expect(record.adopted.mount).toBe(mount);
  });

  it("an existing slug is a hard error and the record keeps its row", async () => {
    await Deno.writeTextFile(`${ledger}/instances.json`, JSON.stringify({ adopted: { mount: "/held" } }));
    const mount = await Deno.makeTempDir({ suffix: "-second" });
    await expect(drive(["instance/tap", mount, "--slug=adopted"])).rejects.toThrow("instance 'adopted' exists");
    expect(JSON.parse(await Deno.readTextFile(`${ledger}/instances.json`)).adopted.mount).toBe("/held");
  });

  it("nothing at the path is an honest error", async () => {
    await expect(drive(["instance/tap", "/no/such/dir", "--slug=ghost"])).rejects.toThrow("no directory at /no/such/dir");
  });
});
