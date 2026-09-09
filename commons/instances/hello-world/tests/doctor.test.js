import { specimen } from "@vivalence/typology";
import { machine, variables } from "../tools/doctor.js";

const STANDING = {
  instance: { slug: "hello-world" },
  daemon: {
    slug: "runtime",
    mountpoint: "/Users/x/.viva/instances/hello-world/mountpoint",
  },
  entities: ["buffer", "thread", "turn"],
  modes: [
    {
      slug: "hello-world",
      traits: ["APPLICATION", "CONVERSATIONAL"],
      routes: ["/hello/doctor", "/hello/bot"],
    },
    { slug: "runtime", traits: [], routes: [] },
  ],
  faults: [],
};

specimen.describe("doctor — the standing projection", () => {
  specimen.it(
    "P-machine: one instance line, one daemon line, one line per mode",
    () => {
      const lines = machine(STANDING).split("\n");
      specimen.expect(lines.length).toBe(5);
      specimen.expect(lines[0]).toBe(
        "instance hello-world at /Users/x/.viva/instances/hello-world/mountpoint",
      );
      specimen.expect(lines[1]).toBe(
        "daemon runtime · entities buffer thread turn",
      );
      specimen.expect(lines[2]).toBe(
        "mode hello-world [APPLICATION CONVERSATIONAL] /hello/doctor /hello/bot",
      );
      specimen.expect(lines[3]).toBe("mode runtime [] no routes");
      specimen.expect(lines[4]).toBe("settled");
    },
  );

  specimen.it("P-machine: faults replace 'settled' and name where", () => {
    const faulted = machine({
      ...STANDING,
      faults: [{ at: "hallucinators.0" }, { at: "datamap" }],
    });
    specimen.expect(faulted.split("\n").at(-1)).toBe(
      "FAULTS hallucinators.0 datamap",
    );
  });

  specimen.it("P-machine: an unmounted daemon is named, not undefined", () => {
    const loose = machine({
      ...STANDING,
      daemon: { slug: null, mountpoint: null },
      entities: [],
    });
    specimen.expect(loose).toContain("instance hello-world at unmounted");
    specimen.expect(loose).toContain("daemon unnamed · entities none");
  });
});

specimen.describe("doctor — the environment projection", () => {
  const env = {
    vars: { VIVA_MOUNT: 1, PUBLIC_URL: 1, EMPTY_ONE: 1 },
    get: (key) =>
      ({
        VIVA_MOUNT: "/tmp/x",
        PUBLIC_URL: "http://localhost:2501",
        EMPTY_ONE: "",
      })[key],
  };

  specimen.it(
    "P-novalues: every entry is {key, set}, sorted, and holds no value",
    () => {
      const held = variables(env);
      specimen.expect(held).toEqual([
        { key: "EMPTY_ONE", set: false },
        { key: "PUBLIC_URL", set: true },
        { key: "VIVA_MOUNT", set: true },
      ]);
    },
  );

  specimen.it("P-novalues: no planted value survives serialisation", () => {
    const serialised = JSON.stringify(variables(env));
    specimen.expect(serialised).not.toContain("/tmp/x");
    specimen.expect(serialised).not.toContain("http://localhost:2501");
  });
});
