import paladin, { factories } from "@vivalence/paladin";
import { Vector, control } from "@vivalence/typology";

const follow = async (shellDie) => {
  const [sieve] = shellDie.signal.body;
  if (!sieve) throw new Error(`usage: viva instance/tail '{"<path>":["<track>", …]}'`);
  await factories.instance(paladin);
  await paladin.telemetry.watch({ console: sieve }, control.hold(shellDie.controller));
};

const pipe = async (shellDie) => {
  const [target, sieve] = shellDie.signal.body;
  if (!target || !sieve) throw new Error(`usage: viva instance/pipe <file>.jsonl '{"<path>":["<track>", …]}'`);
  await factories.instance(paladin);
  await paladin.telemetry.watch({ [target]: sieve }, control.hold(shellDie.controller));
};

export const tail = new Vector()
  .open(
    {
      nature: "/instance/tail",
      valence:
        "follow this instance's running processes through a sieve, on this terminal. " +
        'Example: viva instance/tail \'{"/runtime/runtime/daemon/droneaid/(.*)":["request","response"]}\'',
    },
    follow,
  )
  .open(
    {
      nature: "/instance/pipe",
      valence:
        "follow this instance's running processes through a sieve into a file under its logs, while this runs. " +
        'Example: viva instance/pipe calls.jsonl \'{"/runtime/runtime/daemon/droneaid/(.*)":["request","response"]}\'',
    },
    pipe,
  );
