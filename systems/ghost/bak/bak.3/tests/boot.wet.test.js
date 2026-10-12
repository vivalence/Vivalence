import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { boot } from "./scenarios/hello.js";
import { viva } from "./subprocess.js";

const { describe, it, expect } = specimen;

describe("bare viva with no runtime at its remote boots the instance's own, attached, and takes it down on exit", () => {
  it("the client serves on the booted runtime; its log carries readiness; after /quit no lock and nothing listens", async () => {
    const world = await boot({ prefix: "viva-boot-" });
    world.child.kill("SIGTERM");
    await world.child.status;
    try {
      expect(await fetch(`${world.origin}/status`).then(() => "up", () => "down")).toBe("down");
      const held = await viva([], { cwd: join(world.root, "instance"), env: world.env, stdin: "/quit\n" });
      expect(held.code).toBe(0);
      expect(held.err).toContain(`ghost: no runtime at ${world.origin}/ — booting hello-world's own`);
      const log = await Deno.readTextFile(join(world.root, "ledger/logs/hello-world/runtime.out.log"));
      expect(log).toContain("Status:RUNNING");
      const locks = await Array.fromAsync(Deno.readDir(join(world.root, "ledger/locks")));
      expect(locks).toEqual([]);
      expect(await fetch(`${world.origin}/status`).then(() => "up", () => "down")).toBe("down");
    } finally {
      await Deno.remove(world.root, { recursive: true });
    }
  });
});
