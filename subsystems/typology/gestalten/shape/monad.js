import * as steer from "../steer/index.js";
import * as control from "../belt/control.js";

export const idle = (die) => {
  if (!die.controller.status.is("IDLE")) throw new Error(`${die.controller.stdout.absolute} is ${die.controller.status.reflection.code}, booted once already`);
  return die;
};

export const dispatch = (execution) => (die) => {
  steer.dispatch.execute(execution, die);
  return die;
};

export const controlled = async (die) => {
  await control.controlled(die.controller);
  return die;
};

export const execute = (execution) => async (die) => {
  await steer.dispatch.execute(execution, die);
  return die;
};

export const ready = (execution) => [idle, dispatch(execution), controlled];
