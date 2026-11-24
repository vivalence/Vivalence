import type { ExecutionDie, Next } from "./types.d.ts";

export const aperture = async (die: ExecutionDie, next: Next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
};

export const modes = async (die: ExecutionDie, next: Next) => {
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  await next();
};
