import docker from "./docker/docker.js";
import env from "./envmanager/envmanager.js";

export default function services(viva) {
  viva.locals.env = env;
  viva.locals.docker = docker.docker;
  viva.locals.compose = docker.compose;
  return viva;
}
