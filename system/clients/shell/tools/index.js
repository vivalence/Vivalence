import docker from "./docker/docker.js";
import env from "./envmanager/envmanager.js";
import process from "./process/index.js";

export default {
  process,
  env,
  docker: docker.docker,
  compose: docker.compose,
};
