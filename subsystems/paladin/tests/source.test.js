import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import source from "../belt/source.js";

const paladin = {
  scope: { repository: { branch: (segment) => ({ repository: segment }) } },
};
source(paladin);

describe("paladin.source", () => {
  it("absolute string — as-is", () => {
    expect(paladin.source("/opt/packages/viva").absolute).toBe("/opt/packages/viva");
  });

  it("./ and ../ — relative to CLI execution (INIT_CWD wins)", () => {
    Deno.env.set("INIT_CWD", "/work/here");
    expect(paladin.source("./packages/viva").absolute).toBe("/work/here/packages/viva");
    Deno.env.delete("INIT_CWD");
  });

  it("{file, source} — relative to the declaring file", () => {
    const resolved = paladin.source({ file: "file:///repo/registry/simulation/instance/test.viva.js", source: "../fixtures" });
    expect(resolved.absolute).toBe("/repo/registry/simulation/fixtures");
  });

  it("bare segment — repo-root-relative via scope.repository", () => {
    expect(paladin.source("commons")).toEqual({ repository: "commons" });
  });
});
