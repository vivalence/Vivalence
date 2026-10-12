import { Controller, Path, Span, Vector, shard, specimen, steer } from "@vivalence/typology";
import { accio } from "@vivalence/runtime/scenarios";
import * as ghost from "@vivalence/ghost";

const { verbs, modes, surface } = ghost.lifecycle.client;
const execution = new Vector().use(shard.controller.open).use(verbs).use(modes).use(surface).do(shard.controller.hold);

specimen.describe("a hosted mode lends its verbs to the repl — REPLING composes per line", () => {
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const root = new Controller({ stdout: new Span("ghost") });
  const clientDie = new ghost.Client({ controller: root.branch("client"), mask, register: null, instance: null, surface: () => () => {} });
  const tail = clientDie.controller.stdout.tail("message", "fault");

  specimen.it("/hello answers from @commons/home/console; /help lists hello and whoami beside the client's verbs", async () => {
    clientDie.register = { modes: [await accio({ module: "@commons/home/console", reference: new Path("/mode/home/console") })] };
    const held = steer.dispatch.execute(execution, clientDie);
    await clientDie.dispatch("/hello");
    specimen.expect(tail.get().at(-1).data).toBe("hello from ghost");
    await clientDie.dispatch("/help");
    specimen.expect(Object.keys(tail.get().at(-1).data.branches)).toEqual(["help", "quit", "hello", "whoami"]);
    await clientDie.dispatch("/quit");
    await held;
  });
});
