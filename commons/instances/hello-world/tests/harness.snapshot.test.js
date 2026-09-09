import { join } from "@std/path";
import { specimen } from "@vivalence/typology";
import { machine } from "../tools/doctor.js";
import { FORMAT, HELLO } from "../harness.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

export function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    specimen.snapshot(pojo, {
      base: SNAPSHOTS,
      locate: file,
      parse: (value) => value,
    });
  }
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
}

// a FIXED standing record — never the live one, so the file cannot pick up this machine.
const STANDING = {
  instance: { slug: "hello-world" },
  daemon: {
    slug: "runtime",
    mountpoint: "/ledger/instances/hello-world/mountpoint",
  },
  entities: ["buffer", "thread", "turn"],
  modes: [
    {
      slug: "hello-world",
      traits: ["APPLICATION", "CONVERSATIONAL"],
      routes: ["/hello/doctor", "/hello/bot", "/hello/agent"],
    },
    { slug: "runtime", traits: [], routes: [] },
  ],
  faults: [],
};

specimen.describe(
  "hello-world harness snapshot — the system bag, offline",
  () => {
    specimen.it(
      "S0: every section that reaches a model, verbatim — format rides /dialogue only",
      () => {
        pin(
          { hello: HELLO, format: FORMAT, machine: machine(STANDING) },
          "hello-world-harness.snapshot.json",
        );
      },
    );

    specimen.it("S0: hello names the tools by their ARMED names", () => {
      specimen.expect(HELLO).toContain("viva_doctor");
      specimen.expect(HELLO).toContain("web_search");
      specimen.expect(HELLO).not.toContain("search_web");
      specimen.expect(HELLO).not.toContain("search_read");
    });
  },
);
