import { specimen, traits } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const belt = ghost.belt;

Object.defineProperty(ghost.terminal.Terminal.prototype, "dock", {
  get() {
    const narrow = this.client.app !== null && this.client.app.bridge.viewport.narrow;
    return {
      ...belt.dock.DEFAULT_DOCK,
      ...(narrow ? { align: "bottom" } : {}),
      ...this.client.mask.trait.DOCKED,
      ...this.client.runtime.lighthouse.user.trait.DOCKED,
      ...this.trait.DOCKED,
    };
  },
});

ghost.terminal.Terminal.prototype.setBuffer = function (buffer) {
  if (buffer === null) return this.repository.updateOne({ id: this.id }, { buffer: null });
  if (this.dock.view !== "full") return this.repository.updateOne({ id: this.id }, { buffer: buffer.id });
  const DOCKED = { view: "docked", shown: "docked" };
  return this.repository.updateOne({ id: this.id }, { buffer: buffer.id, ...traits.patch(this, { DOCKED }) });
};

const seated = (trait, app) => {
  const sent = [];
  const terminal = Object.assign(new ghost.terminal.Terminal(), {
    id: "t1",
    traits: Object.keys(trait),
    trait,
    client: { app, mask: { trait: {} }, runtime: { lighthouse: { user: { trait: {} } } } },
    repository: { updateOne: async (where, data) => sent.push(data) },
  });
  return { terminal, sent };
};

specimen.describe("dock half", () => {
  specimen.it("a buffer framed on a full dock docks it, in one write", async () => {
    const { terminal, sent } = seated({}, null);
    await terminal.setBuffer({ id: "b1" });
    specimen.expect(sent).toEqual([{ buffer: "b1", traits: ["DOCKED"], trait: { DOCKED: { view: "docked", shown: "docked" } } }]);
  });
  specimen.it("docked, closed, messenger stay; null stays", async () => {
    for (const view of ["docked", "closed", "messenger"]) {
      const { terminal, sent } = seated({ DOCKED: { view } }, null);
      await terminal.setBuffer({ id: "b1" });
      await terminal.setBuffer(null);
      specimen.expect(sent).toEqual([{ buffer: "b1" }, { buffer: null }]);
    }
  });
  specimen.it("narrow defaults bottom; a stated align wins; wide and no app stay right", () => {
    const app = (narrow) => ({ bridge: { viewport: { narrow } } });
    specimen.expect(seated({}, app(true)).terminal.dock.align).toBe("bottom");
    specimen.expect(seated({ DOCKED: { align: "left" } }, app(true)).terminal.dock.align).toBe("left");
    specimen.expect(seated({}, app(false)).terminal.dock.align).toBe("right");
    specimen.expect(seated({}, null).terminal.dock.align).toBe("right");
  });
});
