import paladin from "@vivalence/paladin";
import { Connection } from "@vivalence/typology";
import { specs } from "./target.js";
import { Init } from "./Init.jsx";

/**
 * $shell — viva instance/init [variant] [--flag=value]
 *   argv[0] "instance/init" → nature (path segments). non-"--" args → ctx.signal.params.
 *   "--key=value" → ctx.signal.flags[key] = "value".  "--key" → flags[key] = true.
 *
 * ctx — per-invocation envelope (ambient; reference ctx.x inline, never alias into locals):
 *   signal   parsed command (params / flags)             — input
 *   view     sheets view { flow:{emit,render}, buffer:{render} } — mounts ink, resolves on buffer.release(opts)
 *   span     trace trie root; branch() per process       — telemetry
 *   effect   the handler result                          — output (set it, do not read)
 *
 * the wizard (boot → create → install → ready) lives in ./Init.jsx; this handler
 * is the faculties it drives: boot the variant, sign up the admin, tear it down.
 */

export async function init(ctx) {
  await paladin.variant.mount();

  let held = [];

  const boot = async () => {
    held = await paladin.system.boot(specs(ctx.signal.params[0], { attachment: "piped" }));
    for (const process of held) {
      const branch = ctx.span?.branch(`init/${process.spec.type}`).begin();
      branch?.track.subject().target("process", process.pid);
      process.status.then((exit) => {
        if (!exit.success) branch?.track.fault().raise(`exit ${exit.code}`, "EXIT");
        branch?.seal();
      });
    }
    return held;
  };

  const signup = (values) =>
    new Connection(paladin.variant.clients.ghost.statics.lighthouse.remote).call("/auth/signup", {
      username: values.username,
      password: values.password,
    });

  const teardown = () => Promise.all(held.map((process) => process.kill()));

  ctx.effect = await ctx.view.scroll.render({ boot, signup, teardown }, null, Init);

  // register the instance with the ledger (testament/ledger/instances.json)
  const mount = paladin.scope.variant.absolute;
  const manifest = paladin.variant.manifest;
  await paladin.system.instances.write(mount, { mount, manifest });
}
