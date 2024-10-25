import RC from "./controller/Runtime.js";

export default function root(trajectory) {
  trajectory.use((t) => {
    trajectory.setMode("closed");

    const loadSpacebar = () =>
      trajectory.use((t) => {
        trajectory.clean();
        trajectory.setMode("open");
        t.set(t.signals.navigation.s({ label: "(s)trategy" }), RC);

        t.set(t.signals.navigation.y({ label: "(y)ank cookie" }), () => {
          const cookie = document.cookie;
          navigator.clipboard.writeText(cookie).then(
            () => console.log("Async: Copying to clipboard was successful!", cookie),
            (err) => console.error("Async: Could not copy text: ", err),
          );
          t.root();
        });
      });

    t.set(t.signals.keyboard["Space"], loadSpacebar);
  });
  return trajectory;
}
