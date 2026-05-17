import * as instance from "./instance/index.js";
// import * as sheets from "./sheets/index.js";

export default function (trajectory) {
  trajectory.open("/instance/clone", instance.clone);
  trajectory.open("/instance/init", instance.init);
  trajectory.open("/instance/run", instance.run);
  // trajectory.open("/instance/start", instance.start);
  // trajectory.open("/instance/stop", instance.stop);
}
