import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { link } from "../gestalten/belt/link.js";

const paladin = {
  scope: { repository: { branch: (segment) => ({ repository: segment }) } },
};
link(paladin);

describe("paladin.link.path", () => {
  it("absolute string — as-is", () => {
    expect(paladin.link.path("/opt/packages/viva").absolute).toBe("/opt/packages/viva");
  });

  it("./ and ../ — relative to CLI execution (INIT_CWD wins)", () => {
    Deno.env.set("INIT_CWD", "/work/here");
    expect(paladin.link.path("./packages/viva").absolute).toBe("/work/here/packages/viva");
    Deno.env.delete("INIT_CWD");
  });

  it("{file, source} — relative to the declaring file", () => {
    const resolved = paladin.link.path({ file: "file:///repo/registry/simulation/instance/test.viva.js", source: "../fixtures" });
    expect(resolved.absolute).toBe("/repo/registry/simulation/fixtures");
  });

  it("bare segment — repo-root-relative via scope.repository", () => {
    expect(paladin.link.path("commons")).toEqual({ repository: "commons" });
  });
});
