import { testRender } from "@opentui/solid";

export const settle = async (setup, passes = 4) => {
  for (let pass = 0; pass < passes; pass++) {
    await setup.renderOnce();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

export const screen = (options) => testRender(() => [], { width: 100, height: 30, ...options });
