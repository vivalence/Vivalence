import { specimen, steer } from "@vivalence/typology";
import { hello } from "@vivalence/runtime/scenarios";
import { Client } from "../prototypes/client.js";
import { execution } from "../lifecycle/client/execution.js";
import { headless } from "./headless.js";

const DEADLINE = 20000;

specimen.it("a client die against a dead remote settles faulted inside the deadline, naming it, never hangs", async () => {
  const remote = `http://localhost:${hello.free()}/`;
  const client = new Client({ manifest: { type: "client", slug: "test" }, statics: { remote }, traits: [], trait: {} });
  const die = { controller: client.controller, mask: client.mask, surface: headless(), client };
  let timer;
  const deadline = new Promise((resolve) => (timer = setTimeout(() => resolve({ code: "HUNG" }), DEADLINE)));
  const running = steer.dispatch.execute(execution, die);
  try {
    const settled = await Promise.race([client.controller.settled, deadline]);
    specimen.expect(settled.code).not.toBe("HUNG");
    specimen.expect(settled.code).not.toBe("RUNNING");
    const { error } = client.controller.status.reflection;
    specimen.expect(error.message.includes(new URL(remote).host) || /NETWORK/.test(error.message)).toBe(true);
    await running;
  } finally {
    clearTimeout(timer);
  }
});
