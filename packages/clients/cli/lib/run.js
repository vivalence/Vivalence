import { parsers, Walker, Deferred } from "@vivalence/shared/trajectory";
import { Prompt } from "@vivalence/interfaces-cli";

export default async (viva) => {
  const signal = parsers.sig.signal(Deno.args.join("/"));

  const deferred = new Deferred();
  const walker = new Walker(viva.trajectory, deferred);

  await walker.walk(signal, async (docs) => {
    const selection = await Prompt.Select.prompt({
      message: "",
      options: docs.map((d) => d.segment),
    });
    const signal = parsers.sig.signal(selection);
    return signal;
  });

  const handler = await deferred.handler;
  const ctx = { ...viva };
  const result = await handler({}, ctx);

  return viva;
};
