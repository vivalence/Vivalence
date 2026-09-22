import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { schematics } from "../typology/index.js";

describe("the runtime's door — optional for paladin, required here", () => {
  const sentences = (held) => schematics.Instance.faults(held).map(({ at, reason }) => `${at} ${reason}`);

  it("an instance without a runtime is refused at the door, by the slot", () => {
    expect(sentences({ manifest: { type: "instance", slug: "x", version: "0.0.1" }, environment: {} })).toEqual(["/ must have required properties runtime"]);
  });
  it("an instance with one passes, whatever else it lacks — paladin judged the rest", () => {
    expect(sentences({ manifest: { type: "instance", slug: "x", version: "0.0.1" }, environment: {}, runtime: { manifest: { slug: "runtime" } } })).toEqual([]);
  });
});
