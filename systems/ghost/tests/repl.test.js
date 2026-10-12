import { Controller, Path, Span, Vector, shard, specimen, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const { verbs: clientVerbs, modes, surface } = ghost.lifecycle.client;
const execution = new Vector().use(shard.controller.open).use(clientVerbs).use(modes).use(surface).do(shard.controller.hold);

const verbs = (tail) => tail.get().map((record) => record.verb);

specimen.describe("repl — a line becomes records on the client's span; the tail is what a surface paints", () => {
  const root = new Controller({ stdout: new Span("ghost") });
  const mask = { manifest: { type: "client", slug: "ghost", traits: [] }, reference: new Path("/client/ghost"), modes: [] };
  const client = new ghost.Client({ controller: root.branch("client"), mask, register: { modes: [] }, instance: null, surface: () => () => {} });
  const held = steer.dispatch.execute(execution, client);
  const dispatch = (line) => client.dispatch(line);
  const tail = client.controller.stdout.tail("message", "fault", "turn");

  specimen.it("/help answers with a message holding the verbs as a tree, valence on each", async () => {
    await dispatch("/help");
    specimen.expect(verbs(tail)).toEqual(["message"]);
    specimen.expect(Object.keys(tail.get()[0].data.branches)).toEqual(["help", "quit"]);
    specimen.expect(tail.get()[0].data.branches.quit.effect.valence).toMatch(/Example: \/quit/);
    specimen.expect(tail.get()[0].path).toBe("/ghost/client/help");
  });

  specimen.it("a bare line with no terminal is NotFound — a fault on the line's branch /*", async () => {
    await dispatch("ciao").catch(() => {});
    specimen.expect(verbs(tail)).toEqual(["message", "fault"]);
    specimen.expect(tail.get()[1].path).toBe("/ghost/client/*");
  });

  specimen.it("an unknown verb settles the line FAILED AND leaves a fault record", async () => {
    await dispatch("/typo").catch(() => {});
    specimen.expect(verbs(tail)).toEqual(["message", "fault", "fault"]);
    specimen.expect(tail.get()[2].path).toBe("/ghost/client/typo");
  });

  specimen.it("a tail opened late replays the journal — a surface mounted after the fact sees everything", () => {
    specimen.expect(verbs(client.controller.stdout.tail("message", "fault", "turn"))).toEqual(verbs(tail));
    specimen.expect(verbs(client.controller.stdout.tail("fault"))).toEqual(["fault", "fault"]);
  });

  specimen.it("a vector grafted onto the client's repl after boot answers on the next line — composition is per line", async () => {
    client.repl.graft(new Vector().open({ nature: "/late", valence: "grafted after boot. Example: /late" }, () => "late"));
    await dispatch("/late");
    specimen.expect(tail.get().at(-1).data).toBe("late");
  });

  specimen.it("/quit kills the client; the lifecycle unwinds and settles STOPPED", async () => {
    await dispatch("/quit");
    await held;
    await client.controller.settled;
    specimen.expect(client.controller.status.reflection.code).toBe("STOPPED");
  });
});
