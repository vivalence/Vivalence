import { Connection, Dataspace, Path, Url, monad, shape, shard } from "@vivalence/typology";
import { Client } from "./prototype.js";
import { execution } from "./lifecycle/index.js";
import * as daemonHost from "../../entities/daemon/index.js";
import * as mode from "../../entities/mode/index.js";
import * as terminalProcess from "../terminal/index.js";
import * as threadProcess from "../../entities/thread/index.js";
import * as activity from "../../entities/activity/index.js";
import * as buffer from "../../entities/buffer/index.js";
import * as turn from "../../entities/turn/index.js";
import * as view from "../../entities/view/index.js";
import * as file from "../../entities/file/index.js";
import { Runtime } from "../../entities/runtime/prototype.js";
import { Lighthouse } from "../../entities/lighthouse/prototype.js";

export const connected = async (clientDie) => {
  const runtime = clientDie.runtime;
  runtime.multiplex = shard.transmitter.multiplex({ authority: runtime.lighthouse.$authority, vector: clientDie.aperture });
  runtime.connection = new Connection(runtime.remote, shard.transmitter.retry(runtime.multiplex, { maxRetries: 2 }))
    .use(shard.track.request())
    .use(shard.track.fault())
    .use(shard.connection.authorize(runtime.lighthouse.$authority))
    .use(shard.connection.timeout(8000));
  runtime.lighthouse.connection = runtime.connection;
  try {
    runtime.lighthouse.manifest = await runtime.connection.call("/lighthouse/metadata");
    runtime.manifest = await runtime.connection.call("/metadata/manifest");
  } catch (error) {
    runtime.multiplex.close();
    throw error;
  }
  runtime.reference = new Path(`/runtime/${runtime.manifest.slug}`);
  runtime.aperture = runtime.connection.branch(runtime.reference.absolute);
  runtime.entities = new Dataspace({
    runtime,
    entities: { daemon: daemonHost, mode, thread: threadProcess, buffer, turn, activity, terminal: terminalProcess, view, file },
    seed: (boot) => boot.use(shard.context.bind("client", clientDie)).use(shard.context.bind("runtime", runtime)),
  });
  clientDie.controller.stdout.log({ lighthouse: runtime.remote.absolute, traits: runtime.lighthouse.manifest.traits });
  return clientDie;
};

export const factory = monad.kleisli([
  (shellDie) => new Client({ controller: shellDie.controller.branch("client"), mask: shellDie.mask, register: shellDie.register, instance: shellDie.instance }),
  (clientDie) =>
    Object.assign(clientDie, {
      runtime: new Runtime({
        remote: new Url(clientDie.instance.runtime.statics.remote),
        lighthouse: Object.assign(new Lighthouse(), { stdout: clientDie.controller.stdout.branch("lighthouse") }),
      }),
    }),
  connected,
  ...shape.monad.ready(execution),
]);
