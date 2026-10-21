// m88 stretch three · m96 ruling 7 — runtime REPLING: a mode's repl is its module's, seated in the host's context; /metadata/repl serves its strip; /repl dispatches a Signal { nature, body, flags } and answers the verb's own value
import { Aperture, Mode, Path, Vector, shape, specimen, steer } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";

const { REPLING } = traits.mode;
const call = (aperture, route, input) => steer.dispatch.invoke(aperture, route, steer.strategy.request)(input);

specimen.describe("REPLING (runtime) — the stripwire routine's runtime half", () => {
  const repl = new Vector().open(
    { nature: "/hello", valence: "the mode answers from inside its host's context. Example: /hello ciao" },
    (ctx) => `hello from ${ctx.mode.manifest.slug} on ${ctx.reference.absolute}: ${ctx.signal.body.join(" ")}`,
  );
  const mode = new Mode({ manifest: { type: "home", slug: "console", traits: ["REPLING"] }, repl });
  mode.aperture = new Aperture();
  const context = { reference: new Path("/daemon/probe") };

  specimen.it("REPLING seats the module's repl as mode.repl, the host's context and the mode bound on every line", () => {
    REPLING(mode, context);
    specimen.expect(mode.repl).toBe(mode.module.repl);
    specimen.expect(Object.keys(shape.strip(mode.repl).branches)).toEqual(["hello"]);
  });

  specimen.it("/metadata/repl serves the strip — the declaration, valence on each effect", async () => {
    const strip = await call(mode.aperture, "/metadata/repl");
    specimen.expect(Object.keys(strip.branches)).toEqual(["hello"]);
    specimen.expect(strip.branches.hello.effect).toEqual({ valence: "the mode answers from inside its host's context. Example: /hello ciao" });
  });

  specimen.it("/repl takes a Signal { nature, body, flags }, dispatches it on mode.repl under the host's context, and answers the verb's value", async () => {
    const output = await call(mode.aperture, "/repl", { nature: "/hello", body: ["ciao"], flags: {} });
    specimen.expect(output).toBe("hello from console on /daemon/probe: ciao");
  });
});
