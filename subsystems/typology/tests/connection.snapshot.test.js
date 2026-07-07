// snapshot demo · connection — a transport-dual Connection (url + branched children tree).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Connection, Url } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: connection", () => {
  // connection — machinery ($state atom, transport fn) shed by fold → parse-override the live spine
  it("captures connection", () => {
    const connection = new Connection(new Url("http://localhost:2501/daemon/brazilian"));
    connection.branch("/metadata/modes");
    connection.branch("/turns");

    const { pojo, path } = snapshot(connection, {
      base,
      dry: DRY,
      locate: "connection.snapshot.json",
      parse: (c) => ({
        url: c.url.json,
        state: c.$state.get(),
        children: [...c.children.keys()],
      }),
    });
    console.log(`\n===BEGIN connection → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.url.origin).toBe("http://localhost:2501");
    expect(pojo.state).toBe("IDLE");
    expect(pojo.children).toEqual(["metadata", "turns"]);
  });
});
