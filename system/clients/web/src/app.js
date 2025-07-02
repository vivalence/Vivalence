import { browser } from "$app/environment";
import createCall from "./lib/call.js";
// import makeModules from "./lib/modules.js";
import { Trajectory, parsers } from "@vivalence/trajectory";

let client;
let ctx;

async function boot() {
  client = {
    state: {},
    locals: {},
    identity: {},
    call: null,
    runtime: null,
    daemon: null,
    // todo: rename vector
    trajectory: new Trajectory([parsers.key]),
  };
  // session management

  // ctx.client.trajectory.branch((p) => p.key("p"));

  ctx.identity = {
    //
    getUser: async () => await Promise.resolve({ id: "localhost" }),
  };

  ctx.call = createCall({});

  ctx.daemon = { call: ctx.call.wrap("/aperture/v1/daemon") };

  if (browser && !window.viva) {
    window.viva = ctx;
  }

  return ctx;
}

export default async function load(event) {
  if (!ctx) await boot();
  ctx.event = event;
  return ctx;
}
