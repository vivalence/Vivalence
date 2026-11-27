import { specimen, release } from "@vivalence/typology";

const order = (releases) =>
  [...releases].sort((left, right) => release.compare(release.parse(left), release.parse(right)));

specimen.describe("belt.release — parse · compare", () => {
  specimen.it("a padded month parses and keeps its place", () => {
    specimen.expect(release.parse("2027.01.0")).toEqual([2027, 1, 0]);
    specimen.expect(order(["2027.01.0", "2026.12.0", "2026.11.1", "2026.11.0"])).toEqual([
      "2026.11.0",
      "2026.11.1",
      "2026.12.0",
      "2027.01.0",
    ]);
  });

  specimen.it("the last number counts, never spells", () => {
    specimen.expect(order(["2027.01.10", "2027.01.9"])).toEqual(["2027.01.9", "2027.01.10"]);
  });

  specimen.it("an unstamped mount and an LTS version parse", () => {
    specimen.expect(release.parse("0.0.0")).toEqual([0, 0, 0]);
    specimen.expect(release.parse("1.4.2")).toEqual([1, 4, 2]);
  });

  specimen.it("equal releases compare to 0", () => {
    const stood = release.parse("2026.11.1");
    specimen.expect(release.compare(stood, release.parse("2026.11.1"))).toBe(0);
  });

  specimen.it("a tag, a channel and a word throw", () => {
    for (const written of ["v2026.11.1", "2026.11", "latest", ""]) {
      specimen.expect(() => release.parse(written)).toThrow(`not a release: ${written}`);
    }
  });
});
