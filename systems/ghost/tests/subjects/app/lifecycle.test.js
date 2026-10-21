import { Controller, Span, Vector, control, shard, specimen, steer } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const held = new Vector().use(shard.controller.open).do(shard.controller.hold);

specimen.describe("the app's lifecycle — bundle before mount, the surface mounted over the app die, unmounted after the hold; the app lives as long as its client", () => {
  specimen.it("bundle: the surface writes before next runs; the app's controller logs outfile · bytes", async () => {
    const order = [];
    const appDie = {
      controller: new Controller({ stdout: new Span("ghost") }).branch("app"),
      surface: { bundle: async () => { order.push("bundle"); return { outfile: "app.mjs", bytes: 7 }; } },
    };
    await ghost.app.lifecycle.bundle(appDie, async () => { order.push("next"); });
    specimen.expect(order).toEqual(["bundle", "next"]);
    specimen.expect(appDie.controller.stdout.history.filter((record) => record.track === "log").at(-1).data).toEqual({ bundle: "app.mjs", bytes: 7 });
  });

  specimen.it("mount: the surface mounts over the app die; unmount runs after next, once", async () => {
    const seen = [];
    const appDie = { surface: { mount: async (die) => { seen.push(["mount", die]); return () => seen.push(["unmount"]); } } };
    await ghost.app.lifecycle.mount(appDie, async () => { seen.push(["next"]); });
    specimen.expect(seen.map(([step]) => step)).toEqual(["mount", "next", "unmount"]);
    specimen.expect(seen[0][1]).toBe(appDie);
  });

  specimen.it("client: /quit on the client settles it STOPPED and aborts the app 'client stopped'", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    const appDie = { client: { controller: root.branch("client") }, controller: root.branch("app") };
    const running = steer.dispatch.execute(held, appDie.client);
    const showing = steer.dispatch.execute(new Vector().use(shard.controller.open).use(ghost.app.lifecycle.client).do(shard.controller.hold), appDie);
    await control.controlled(appDie.controller);
    appDie.client.controller.kill("SIGTERM", "quit");
    await showing;
    await running;
    specimen.expect(appDie.client.controller.status.reflection.code).toBe("STOPPED");
    specimen.expect(appDie.controller.status.reflection.reason).toBe("client stopped");
  });

  specimen.it("client: the app ending aborts the client 'app stopped'", async () => {
    const root = new Controller({ stdout: new Span("ghost") });
    const appDie = { client: { controller: root.branch("client") }, controller: root.branch("app") };
    const running = steer.dispatch.execute(held, appDie.client);
    const showing = steer.dispatch.execute(new Vector().use(shard.controller.open).use(ghost.app.lifecycle.client).do(shard.controller.hold), appDie);
    await control.controlled(appDie.controller);
    appDie.controller.abort.abort("chrome closed");
    await showing;
    await running;
    specimen.expect(appDie.client.controller.status.reflection.code).toBe("ABORTED");
    specimen.expect(appDie.client.controller.status.reflection.reason).toBe("app stopped");
  });
});
