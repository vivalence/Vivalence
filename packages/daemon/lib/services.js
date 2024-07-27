import services from "@vivalence/services/server.js";

export default function (params) {
  return { ...params, services: services() };
}
