import Trajectory from "./trajectory.js";

export function createTrajectory(path = "/") {
  return new Trajectory(path);
}
