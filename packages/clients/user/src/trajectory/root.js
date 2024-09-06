import RC from "./controller/Runtime.js";

export default function root(trajectory) {
  // RC(null, trajectory);
  trajectory.use((t) => {
    trajectory.setMode("closed");

    const loadSpacebar = () =>
      trajectory.use((t) => {
        trajectory.clean();
        trajectory.setMode("open");
        t.set(t.signals.navigation.s({ label: "Go to Strategy" }), RC);
      });

    t.set(t.signals.keyboard["Space"], loadSpacebar);
  });
}
