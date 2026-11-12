import * as is from "../is/scalars.js";
import * as object from "./object.js";

export const controlled = (controller, check = (status) => status.code === "RUNNING") =>
  new Promise((resolve, reject) => {
    const judge = (status) => (check(status) ? resolve(controller) : reject(status.error ?? new Error(status.code)));
    if (!controller.status.is("IDLE")) return judge(controller.status.reflection);
    const stop = controller.status.$transient.listen((status) => {
      stop();
      judge(status);
    });
  });

export const hold = (controller) =>
  new Promise((resolve) => {
    const live = () => controller.status.is(["IDLE", "RUNNING", "PAUSED"]);
    if (!live()) return resolve();
    const stop = controller.status.$transient.listen(() => {
      if (live()) return;
      stop();
      resolve();
    });
  });

const locator = (controller) => (is.string(controller) ? (die) => object.at(die, controller) : controller);

export const fault = (controller = (die) => die.controller) => {
  const locate = locator(controller);
  return async (die, next) => {
    try {
      await next();
    } catch (error) {
      locate(die).stdout.fault(error);
    }
  };
};

export const stderr = (controller = (die) => die.controller.stdout) => {
  const stdout = locator(controller);
  return async (die, next) => {
    try {
      await next();
    } catch (error) {
      stdout(die).fault(error);
    }
  };
};
