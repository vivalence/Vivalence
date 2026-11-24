import { Execution } from "./execution.js";

export const aperture = new Execution().use(async (die, next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
});

export const modes = new Execution().use(async (die, next) => {
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  await next();
});
