import { beat } from "./execution.js";

export const aperture = beat(async (die, next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
});

export const modes = beat(async (die, next) => {
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  await next();
});
