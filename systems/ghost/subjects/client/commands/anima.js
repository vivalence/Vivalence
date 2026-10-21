import paladin from "@vivalence/paladin";
import { Argv, Vector, steer } from "@vivalence/typology";

const OPENERS = [
  [(os) => os === "darwin", "open"],
  [(os) => os === "windows", "start"],
  [() => true, "xdg-open"],
];

const served = () => paladin.instance.clients.find((client) => client.manifest.slug === "anima").statics.serve.absolute;

const open = async () => {
  const url = served();
  const [, bin] = OPENERS.find(([test]) => test(Deno.build.os));
  await new Deno.Command(bin, { args: [url] }).output();
  return { opened: url };
};

export const anima = new Vector()
  .open(
    { nature: "/anima", valence: "start anima detached (instance/start anima) and open it in the browser. Example: /anima", chord: "leader/s/a" },
    async (ctx) => ({
      ...(await steer.dispatch.execute(paladin.commands, ctx, new Argv("/instance/start anima"))),
      ...(await open()),
    }),
  )
  .open({ nature: "/anima/open", valence: "open the served anima in the browser. Example: /anima/open" }, open);
