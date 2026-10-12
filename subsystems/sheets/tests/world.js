import { testRender } from "@opentui/solid";
import { tokens } from "@vivalence/dapper";

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];

export const settle = async (setup, passes = 4) => {
  for (let pass = 0; pass < passes; pass++) {
    await setup.renderOnce();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

export const screen = (options) => testRender(() => [], { width: 100, height: 30, ...options });

export const SPLIT = { screenMode: "split-footer", externalOutputMode: "capture-stdout", footerHeight: 12, height: 24, width: 80 };

export const holding = async (kit, kind, props) => {
  const setup = await screen(SPLIT);
  const held = kit.captured(setup.renderer, { ...props, width: 80 }, kit.kinds[kind], tokens("northsea", "1"));
  await settle(setup);
  return { setup, held, frame: () => setup.captureCharFrame(), settle: () => settle(setup) };
};

export const escape = async (setup) => {
  setup.mockInput.pressEscape();
  await new Promise((resolve) => setTimeout(resolve, 60));
};
