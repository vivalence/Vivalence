import docker from "./docker/docker.js";
import env from "./envmanager/envmanager.js";
// locals/index.js - Local tools loader

export default function loadLocals(viva) {
  viva.locals = {
    env,
    docker: docker.docker,
    compose: docker.compose,
  };

  return viva;
}
