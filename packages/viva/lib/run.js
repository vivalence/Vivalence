import {
  TrajectoryParsers,
  TrajectoryWalker,
  TrajectoryDeferred,
} from "@vivalence/shared";
import { Prompt } from "@vivalence/interfaces-cli";

export default async (viva) => {
  const signal = TrajectoryParsers.path.signal(Deno.args.join("/"));

  const deferred = new TrajectoryDeferred();
  const walker = new TrajectoryWalker(viva.trajectory, deferred);

  await walker.walk(signal, async (docs) => {
    const selection = await Prompt.Select.prompt({
      message: "",
      options: docs.map((d) => d.signal),
    });
    const signal = TrajectoryParsers.path.signal(selection);
    return signal;
  });

  const handler = await deferred.promise;
  const result = await handler(viva);

  return viva;
};
