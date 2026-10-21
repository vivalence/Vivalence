const NUMBERS = { SIGINT: 2, SIGQUIT: 3, SIGTERM: 15 };

export const controller = (controller) => {
  const exit = () => {
    if (controller.status.is("DONE")) return 0;
    if (controller.status.is("STOPPED")) return Object.hasOwn(NUMBERS, controller.status.reflection.reason) ? 128 + NUMBERS[controller.status.reflection.reason] : 0;
    if (controller.status.is("FAILED") && controller.status.reflection.error.code === "NOT_FOUND") return 127;
    return 1;
  };
  return { exit: exit() };
};
