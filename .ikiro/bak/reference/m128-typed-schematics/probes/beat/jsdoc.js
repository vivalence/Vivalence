/** @type {import("./types.d.ts").Beat} */
export const aperture = async (die, next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
};

/** @type {import("./types.d.ts").Beat} */
export const modes = async (die, next) => {
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  await next();
};
