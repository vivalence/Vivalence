import { parsers, Walker, Deferred } from "@vivalence/trajectory";
import { Prompt } from "@vivalence/interfaces-cli";

export default async (viva) => {
  const signal = parsers.path.signal(Deno.args.join("/"));

  const deferred = new Deferred();
  const walker = new Walker(viva.trajectory, deferred);

  await walker.walk(signal, async (docs) => {
    const selection = await Prompt.Select.prompt({
      message: "",
      options: docs.map((d) => d.signal),
    });
    const signal = parsers.path.signal(selection);
    return signal;
  });

  const handler = await deferred.promise;
  const result = await handler(viva);

  return viva;
};
