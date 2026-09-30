import { control } from "@vivalence/typology";

export const settle = async (die, next) => {
  try {
    await next();
  } catch (error) {
    die.controller.stdout.fault(error);
  } finally {
    die.controller.stdout.close();
  }
};

export const keepalive = async (die) => {
  die.controller.stdout.open();
  await control.hold(die.controller);
};
