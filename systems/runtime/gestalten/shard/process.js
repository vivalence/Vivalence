import { control } from "@vivalence/typology";

export const settle = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.fault(error);
  } finally {
    die.controller.stop();
  }
};

export const keepalive = async (die) => {
  die.controller.start();
  await control.hold(die.controller);
};
