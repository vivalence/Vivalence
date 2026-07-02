import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Pensieve } from "../prototypes/pensieve.js";

const cake = (owner, type, slug, version = "0.0.1") => ({
  manifest: { owner, type, slug, version },
});

describe("Pensieve", () => {
  it("keys by manifest owner→type→slug→version", async () => {
    const pensieve = new Pensieve();
    pensieve.register(cake("@education", "game", "write"));
    const found = await pensieve.revelio({ owner: "@education", type: "game", slug: "write" });
    expect(found.manifest.slug).toBe("write");
  });

  it("does NOT default a missing owner — mount must stamp", () => {
    const pensieve = new Pensieve();
    expect(() => pensieve.register({ manifest: { type: "game", slug: "write", version: "0.0.1" } }))
      .toThrow();
  });

  it("two packages shipping the same type/slug do not collide", async () => {
    const pensieve = new Pensieve();
    pensieve.register(cake("@education", "game", "flashcard"));
    pensieve.register(cake("@development", "game", "flashcard"));
    const education = await pensieve.revelio({ owner: "@education", type: "game", slug: "flashcard" });
    const development = await pensieve.revelio({ owner: "@development", type: "game", slug: "flashcard" });
    expect(education.manifest.owner).toBe("@education");
    expect(development.manifest.owner).toBe("@development");
  });

  it("latest() resolves the highest semver within a slug", async () => {
    const pensieve = new Pensieve();
    pensieve.register(cake("@education", "game", "write", "0.1.0"));
    pensieve.register(cake("@education", "game", "write", "0.2.0"));
    const found = await pensieve.revelio({ owner: "@education", type: "game", slug: "write" });
    expect(found.manifest.version).toBe("0.2.0");
  });
});
