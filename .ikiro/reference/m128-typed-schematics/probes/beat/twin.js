// @ts-self-types="./twin.d.ts"
export const aperture = async (die, next) => {
  die.aperture.open("/beacon/status", () => die.controller.status);
  await next();
};

export const modes = async (die, next) => {
  die.runtime.controller = die.controller;
  die.runtime.mountpoint = die.mask.mountpoint;
  await next();
};
