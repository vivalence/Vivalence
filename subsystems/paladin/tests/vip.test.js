import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Vip } from "../prototypes/vip.js";

const rootStub = (dir) => ({ absolute: dir });

// modules: path → module namespace (manifest and friends). The walk returns
// every path; a module whose manifest.type is "package" IS the package module.
const fakePaladin = (modules) => ({
  read: { viva: async (path) => modules[path.absolute ?? String(path)] },
  find: { viva: async () => Object.keys(modules).map((absolute) => ({ absolute })) },
});

describe("Vip.mount", () => {
  it("a mount with modules but no package declaration throws — no owner to stamp", async () => {
    const paladin = fakePaladin({
      "/registry/simulation/game/write/write.viva.js": { manifest: { type: "game", slug: "write", version: "0.0.1" } },
    });
    const vip = new Vip(paladin);
    await expect(vip.mount(rootStub("/registry/simulation"))).rejects.toThrow("declares no owner");
  });

  it("the package's authored owner stamps every module in the mount", async () => {
    const paladin = fakePaladin({
      "/registry/simulation/package.viva.js": { manifest: { type: "package", slug: "fixture", version: "0.0.1", owner: "@viva" } },
      "/registry/simulation/game/write/write.viva.js": { manifest: { type: "game", slug: "write", version: "0.0.1" } },
    });
    const vip = new Vip(paladin);
    await vip.mount(rootStub("/registry/simulation"));

    const module = await vip.pensieve.revelio({ owner: "@viva", type: "game", slug: "write" });
    expect(module.manifest.owner).toBe("@viva");
  });

  it("a package declaration WITHOUT owner throws — presence alone stamps nothing", async () => {
    const paladin = fakePaladin({
      "/registry/simulation/package.viva.js": { manifest: { type: "package", slug: "simulation", version: "0.0.1" } },
      "/registry/simulation/game/write/write.viva.js": { manifest: { type: "game", slug: "write", version: "0.0.1" } },
    });
    const vip = new Vip(paladin);
    await expect(vip.mount(rootStub("/registry/simulation"))).rejects.toThrow("declares no owner");
  });

  it("a module's own manifest.owner overrides the package-stamped owner", async () => {
    const paladin = fakePaladin({
      "/registry/simulation/package.viva.js": { manifest: { type: "package", slug: "sim", version: "0.0.1", owner: "@simulation" } },
      "/registry/simulation/fixture/lock-demo/lock-demo.viva.js": { manifest: { owner: "@viva", type: "fixture", slug: "lock-demo", version: "0.0.1" } },
    });
    const vip = new Vip(paladin);
    await vip.mount(rootStub("/registry/simulation"));

    const locked = await vip.pensieve.revelio({ owner: "@viva", type: "fixture", slug: "lock-demo" });
    expect(locked).toBeTruthy();
    const notUnderSimulation = await vip.pensieve.revelio({ owner: "@simulation", type: "fixture", slug: "lock-demo" });
    expect(notUnderSimulation).toBeNull();
  });

  it("demand outrunning supply throws 'not supplied' — distinct from Module 404 (fork 8)", async () => {
    const paladin = fakePaladin({
      "/registry/simulation/package.viva.js": { manifest: { type: "package", slug: "sim", version: "0.0.1", owner: "@simulation" } },
      "/registry/simulation/game/write/write.viva.js": { manifest: { type: "game", slug: "write", version: "0.0.1" } },
    });
    const vip = new Vip(paladin);
    await vip.mount(rootStub("/registry/simulation"));

    await expect(vip.accio("@education/game/write")).rejects.toThrow("not supplied");
    await expect(vip.accio("@simulation/game/missing")).rejects.toThrow("Module 404");
  });
});
