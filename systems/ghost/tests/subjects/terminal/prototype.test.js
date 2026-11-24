import { specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const user = (trait) => ({ runtime: { lighthouse: { user: { traits: Object.keys(trait), trait } } } });
const mask = (trait) => ({ mask: { manifest: { type: "client", slug: "ghost", traits: Object.keys(trait) }, trait } });

specimen.describe("the layers — a dock is default ← mask ← user ← terminal", () => {
  specimen.it("DEFAULT_DOCK carries every field; a layer states only what it overrides; the terminal wins", () => {
    specimen.expect(ghost.belt.dock.DEFAULT_DOCK).toEqual({ align: "right", share: 0.38, view: "full", shown: "full", lens: ["turns", "harness"], markdown: "pretty" });
    const terminal = Object.assign(new ghost.terminal.Terminal(), {
      trait: { DOCKED: { lens: ["repl"] } },
      client: { app: null, ...mask({ DOCKED: { align: "left", share: 0.2 } }), ...user({ DOCKED: { align: "right", share: 0.5 } }) },
    });
    specimen.expect(terminal.dock).toEqual({ align: "right", share: 0.5, view: "full", shown: "full", lens: ["repl"], markdown: "pretty" });
    specimen.expect(ghost.belt.dock.DEFAULT_DOCK).toEqual({ align: "right", share: 0.38, view: "full", shown: "full", lens: ["turns", "harness"], markdown: "pretty" });
  });

  specimen.it("a terminal with no layer over it is the default", () => {
    const terminal = Object.assign(new ghost.terminal.Terminal(), { client: { app: null, ...mask({}), ...user({}) } });
    specimen.expect(terminal.dock).toEqual(ghost.belt.dock.DEFAULT_DOCK);
  });
});
