import * as kit from "../index.js";
import { specimen } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { escape, holding, screen, SPLIT } from "./world.js";

const port = (value) => (/^\d+$/.test(value) ? null : "a port is digits");

const pages = () => [
  {
    title: "addresses",
    fields: [
      { name: "VIVA_PORT", label: "VIVA_PORT", kind: "text", initial: "2501", hint: "the runtime's port", check: port },
      { name: "SECRET_VIVA_JWT", label: "SECRET_VIVA_JWT", kind: "password", initial: "" },
    ],
  },
  {
    title: "choices",
    fields: [
      { name: "how", label: "how", kind: "select", initial: "config", options: [{ label: ".config", value: "config" }, { label: "manual", value: "manual" }] },
      { name: "persist", label: "persist", kind: "confirm", initial: true },
    ],
  },
];

const asked = () => holding(kit, "form", { title: "environment", pages: pages(), actions: ["commit", "skip"] });

const tab = async (view, times = 1) => {
  for (let at = 0; at < times; at++) {
    view.setup.mockInput.pressTab();
    await view.settle();
  }
};

specimen.describe("Form — pages of fields, released as { values, action }", () => {
  specimen.it("shows the title, the page, its fields with presets, the hint of the active one, the actions", async () => {
    const view = await asked();
    const frame = view.frame();
    specimen.expect(frame).toContain("environment  addresses  1/2");
    specimen.expect(frame).toContain("VIVA_PORT       2501");
    specimen.expect(frame).toContain("the runtime's port");
    specimen.expect(frame).toContain("SECRET_VIVA_JWT");
    specimen.expect(frame).toContain(" commit ");
    specimen.expect(frame).not.toContain("how");
    view.setup.renderer.destroy();
  });

  specimen.it("untouched presets are released as values, typed text replaces them, a password is masked", async () => {
    const view = await asked();
    await tab(view);
    await view.setup.mockInput.typeText("s3cret");
    await view.settle();
    specimen.expect(view.frame()).toContain("••••••");
    specimen.expect(view.frame()).not.toContain("s3cret");
    await tab(view);
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toEqual({
      values: { VIVA_PORT: "2501", SECRET_VIVA_JWT: "s3cret", how: "config", persist: true },
      action: "commit",
    });
    view.setup.renderer.destroy();
  });

  specimen.it("a failing check holds the field and names the reason; fixing it lets the form move", async () => {
    const view = await asked();
    for (const _ of "2501") view.setup.mockInput.pressBackspace();
    await view.setup.mockInput.typeText("abc");
    view.setup.mockInput.pressEnter();
    await view.settle();
    specimen.expect(view.frame()).toContain("✕ a port is digits");
    for (const _ of "abc") view.setup.mockInput.pressBackspace();
    await view.setup.mockInput.typeText("8080");
    view.setup.mockInput.pressEnter();
    await view.settle();
    specimen.expect(view.frame()).not.toContain("a port is digits");
    await tab(view);
    view.setup.mockInput.pressEnter();
    specimen.expect((await view.held.released).values.VIVA_PORT).toBe("8080");
    view.setup.renderer.destroy();
  });

  specimen.it("past a page's actions the next page opens; select cycles, confirm toggles", async () => {
    const view = await asked();
    await tab(view, 3);
    specimen.expect(view.frame()).toContain("choices  2/2");
    specimen.expect(view.frame()).toContain("‹ .config ›");
    view.setup.mockInput.pressArrow("right");
    await view.settle();
    specimen.expect(view.frame()).toContain("‹ manual ›");
    await tab(view);
    view.setup.mockInput.pressKey(" ");
    await tab(view);
    view.setup.mockInput.pressArrow("right");
    await view.settle();
    view.setup.mockInput.pressEnter();
    specimen.expect(await view.held.released).toEqual({
      values: { VIVA_PORT: "2501", SECRET_VIVA_JWT: "", how: "manual", persist: false },
      action: "skip",
    });
    view.setup.renderer.destroy();
  });

  specimen.it("up walks back across a page", async () => {
    const view = await asked();
    await tab(view, 3);
    view.setup.mockInput.pressArrow("up");
    await view.settle();
    specimen.expect(view.frame()).toContain("addresses  1/2");
    view.setup.renderer.destroy();
  });

  specimen.it("esc aborts", async () => {
    const view = await asked();
    await escape(view.setup);
    specimen.expect(await view.held.released).toEqual({ aborted: true });
    view.setup.renderer.destroy();
  });

  specimen.it("a field without a kind, or an unknown kind, throws naming it", async () => {
    const setup = await screen(SPLIT);
    const broken = (field) => ({ title: "x", pages: [{ title: "p", fields: [field] }], actions: ["go"], width: 80 });
    const ground = tokens("northsea", "1");
    specimen.expect(() => kit.captured(setup.renderer, broken({ name: "a", label: "a", initial: "" }), kit.Form, ground)).toThrow(/lacks kind/);
    specimen.expect(() => kit.captured(setup.renderer, broken({ name: "a", label: "a", kind: "date", initial: "" }), kit.Form, ground)).toThrow(/text · password · confirm · select/);
    setup.renderer.destroy();
  });
});
