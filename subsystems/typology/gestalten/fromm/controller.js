const NUMBERS = { SIGINT: 2, SIGQUIT: 3, SIGTERM: 15 };

export const controller = (controller) => {
  const stopped = controller.stdout.records.find((record) => record.span === controller.stdout.id && record.verb === "stop");
  const exit = () => {
    if (controller.status.is("DONE")) return 0;
    if (controller.status.is("STOPPED")) return stopped !== undefined && Object.hasOwn(NUMBERS, stopped.data.reason) ? 128 + NUMBERS[stopped.data.reason] : 0;
    if (controller.status.is("FAILED") && controller.status.reflection.error.record.data.code === "NOT_FOUND") return 127;
    return 1;
  };
  return { stopped, exit: exit() };
};
