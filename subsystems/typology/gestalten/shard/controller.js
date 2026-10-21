import { control } from "../belt/index.js";

export const hold = async (die) => {
  await control.hold(die.controller);
};

export const open = async (die, next) => {
  die.controller.start();
  try {
    await next();
  } catch (error) {
    die.controller.fault(error);
  } finally {
    die.controller.stop();
  }
};

export const settle = open;
