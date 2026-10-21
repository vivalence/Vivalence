import { specimen } from "@vivalence/typology";
import { Paladin } from "@vivalence/paladin/typology";
import { FULL } from "../gestalten/belt/index.js";
import { belt } from "../paladin/lifecycle.js";

const { describe, it, expect } = specimen;

describe("paladin.split — a blank never claims", () => {
  it("a blank at a higher stratum does not shadow a real value below it", () => {
    const paladin = belt(new Paladin(), FULL);
    paladin.assign({ SECRET_VIVA_JWT: "", VIVA_A: "" }, "instance");
    paladin.assign({ SECRET_VIVA_JWT: "real", VIVA_A: "1" }, "ledger");
    expect(paladin.secret.get("SECRET_VIVA_JWT")).toBe("real");
    expect(paladin.secret.provenance("SECRET_VIVA_JWT")).toBe("ledger");
    expect(paladin.env.get("VIVA_A")).toBe("1");
    expect(paladin.env.provenance("VIVA_A")).toBe("ledger");
  });

  it("a blank voiced nowhere else stays absent, not empty", () => {
    const paladin = belt(new Paladin(), FULL);
    paladin.assign({ SECRET_VIVA_JWT: "" }, "instance");
    expect(paladin.secret.has("SECRET_VIVA_JWT")).toBe(false);
    expect(paladin.secret.provenance("SECRET_VIVA_JWT")).toBe(null);
  });

  it("reports the blank keys beside held, secrets and ignored", () => {
    const paladin = belt(new Paladin(), FULL);
    const split = paladin.claim({ SECRET_VIVA_JWT: "", VIVA_A: "1", OTHER: "x" }, "instance", "x.env");
    expect(split.blank).toEqual(["SECRET_VIVA_JWT"]);
    expect(split.held).toEqual({ VIVA_A: "1" });
    expect(split.secrets).toEqual({});
    expect(split.ignored).toEqual(["OTHER"]);
  });
});
