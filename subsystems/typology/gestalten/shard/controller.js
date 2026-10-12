import { control } from "../belt/index.js";

export const hold = async (die) => {
  await control.hold(die.controller);
};

export const settle = async (die, next) => {
  die.controller.stdout.open();
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};
