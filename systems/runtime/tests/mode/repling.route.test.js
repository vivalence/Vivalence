import { Aperture, Path, Vector, shape, specimen, steer } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";

const { REPLING } = traits.mode;

specimen.describe("REPLING on the runtime — /repl dispatches the posted Signal through the real aperture", () => {
  const mode = {
    repl: new Vector(),
    aperture: new Aperture(),
    module: {
      repl: new Vector().open({ nature: "/hello", valence: "the mode answers. Example: /hello" }, (ctx) => `hello ${ctx.signal.body.join(" ")}`.trim()),
    },
  };
  const context = { reference: new Path("/runtime/runtime") };
  REPLING(mode, context);

  specimen.it("/metadata/repl strips the mode's repl", async () => {
    const strip = await steer.dispatch.invoke(mode.aperture, "/metadata/repl", steer.strategy.request)();
    specimen.expect(strip).toEqual(shape.strip(mode.repl));
    specimen.expect(Object.keys(strip.branches)).toEqual(["hello"]);
  });

  specimen.it("/repl runs the verb the Signal names; its output is the answer", async () => {
    const output = await steer.dispatch.invoke(mode.aperture, "/repl", steer.strategy.request)({ nature: "/hello", body: ["ciao"], flags: {} });
    specimen.expect(output).toBe("hello ciao");
  });
});
