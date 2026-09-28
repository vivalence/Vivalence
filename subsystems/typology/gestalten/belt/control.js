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
