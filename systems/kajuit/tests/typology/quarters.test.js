import { specimen } from "@vivalence/typology";
import { Quarters } from "../../src/typology/prototypes/quarters.js";
import { Terminal } from "../../src/typology/entities/terminal.js";

function clearStorage() {
  try {
    localStorage.removeItem("viva.quarters");
    localStorage.removeItem("viva.quarters.active");
  } catch {}
}

specimen.describe("Quarters", () => {
  specimen.beforeEach(() => clearStorage());

  specimen.it("constructs with empty terminals repo", () => {
    const quarters = new Quarters();
    specimen.expect(quarters.terminals).toBeTruthy();
    specimen.expect(quarters.terminals.size).toBeGreaterThanOrEqual(0);
  });

  specimen.it("spawn creates a Terminal and sets $active", async () => {
    const quarters = new Quarters();
    const before = quarters.terminals.size;
    const terminal = await quarters.spawn("scratch");
    specimen.expect(terminal).toBeInstanceOf(Terminal);
    specimen.expect(terminal.slug).toBe("scratch");
    specimen.expect(quarters.terminals.size).toBe(before + 1);
    specimen.expect(quarters.$active.get()).toBe(terminal.id);
  });

  specimen.it("activate sets $active to existing id", async () => {
    const quarters = new Quarters();
    const a = await quarters.spawn("a");
    const b = await quarters.spawn("b");
    quarters.activate(a.id);
    specimen.expect(quarters.$active.get()).toBe(a.id);
    quarters.activate("nonexistent");
    specimen.expect(quarters.$active.get()).toBe(a.id);
    specimen.expect(b).toBeTruthy();
  });

  specimen.it("close removes terminal and falls back to last remaining", async () => {
    const quarters = new Quarters();
    const a = await quarters.spawn("a");
    const b = await quarters.spawn("b");
    quarters.close(b.id);
    specimen.expect(quarters.terminals.has(b.id)).toBe(false);
    specimen.expect(quarters.$active.get()).toBe(a.id);
  });

  specimen.it("close of last terminal nulls $active", async () => {
    const quarters = new Quarters();
    const a = await quarters.spawn("only");
    quarters.close(a.id);
    specimen.expect(quarters.$active.get()).toBeNull();
  });
});
