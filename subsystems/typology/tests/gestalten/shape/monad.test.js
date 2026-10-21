import { Controller, Vector, monad, shape, shard, sleep, specimen } from "@vivalence/typology";

const held = () => new Vector().use(shard.controller.open).do(shard.controller.hold);
const failing = () => new Vector().do((die) => die.controller.fault(new Error("refused")));

specimen.describe("shape.monad — a die built, dispatched, handed back", () => {
  specimen.it("ready resolves at RUNNING and hands back the same die", async () => {
    const die = { controller: new Controller() };
    specimen.expect(await monad.kleisli(shape.monad.ready(held()))(die)).toBe(die);
    specimen.expect(die.controller.status.is("RUNNING")).toBe(true);
    die.controller.abort.abort("test over");
    await die.controller.settled;
  });

  specimen.it("a die through ready twice throws — a finished car at the entrance", async () => {
    const die = { controller: new Controller() };
    const boot = monad.kleisli(shape.monad.ready(held()));
    await boot(die);
    await specimen.expect(boot(die)).rejects.toThrow("booted once already");
    die.controller.abort.abort("test over");
    await die.controller.settled;
  });

  specimen.it("a failure before ready rejects the factory", async () => {
    await specimen.expect(monad.kleisli(shape.monad.ready(failing()))({ controller: new Controller() })).rejects.toThrow();
  });

  specimen.it("execute waits for the run's end", async () => {
    const seen = [];
    const finishing = new Vector().do(async () => {
      await sleep.ms(5);
      seen.push("ran");
    });
    await monad.kleisli([shape.monad.execute(finishing)])({});
    specimen.expect(seen).toEqual(["ran"]);
  });
});
