import { specimen } from "@vivalence/typology";
import { gateFor } from "../src/app/gate.js";
import { STANDINGS } from "../src/typology/stores/lighthouse.js";

const WITNESSES = [
  { authorized: false, status: { code: "VERIFIED" }, gate: "signin" },
  { authorized: true, status: { code: "OFFLINE", message: "Network unavailable", canRetry: true }, gate: "signin" },
  { authorized: true, status: { code: "POPULATING" }, gate: "populating" },
  { authorized: true, status: { code: "REFRESHED" }, gate: "verifying" },
  { authorized: true, status: { code: "VERIFIED" }, gate: "ready" },
];

const CODES = [...STANDINGS].sort();

specimen.describe("gateFor — what the shell shows for a lighthouse's standing", () => {
  for (const witness of WITNESSES) {
    specimen.it(`${witness.authorized ? "authorized" : "unauthorized"} · ${witness.status.code} → ${witness.gate}`, () => {
      specimen.expect(gateFor(witness.authorized, witness.status)).toBe(witness.gate);
    });
  }

  specimen.it("the lighthouse writes twelve standings", () => {
    specimen.expect(CODES).toEqual(["AUTHENTICATED", "AUTHENTICATING", "ERROR", "IDLE", "LOGGED_OUT", "OFFLINE", "POPULATING", "REFRESHED", "REFRESHING", "SESSION_EXPIRED", "VERIFIED", "VERIFYING"]);
  });

  specimen.it("without authority every standing is the sign-in", () => {
    for (const code of CODES) specimen.expect([code, gateFor(false, { code })]).toEqual([code, "signin"]);
  });

  specimen.it("with authority the shell opens on VERIFIED alone", () => {
    const opened = CODES.filter((code) => gateFor(true, { code }) === "ready");
    specimen.expect(opened).toEqual(["VERIFIED"]);
  });

  specimen.it("with authority a lost link and a fault return to the sign-in, every other standing waits", () => {
    const shown = Object.fromEntries(CODES.map((code) => [code, gateFor(true, { code })]));
    specimen.expect(shown).toEqual({
      AUTHENTICATED: "verifying",
      AUTHENTICATING: "verifying",
      ERROR: "signin",
      IDLE: "verifying",
      LOGGED_OUT: "verifying",
      OFFLINE: "signin",
      POPULATING: "populating",
      REFRESHED: "verifying",
      REFRESHING: "verifying",
      SESSION_EXPIRED: "verifying",
      VERIFIED: "ready",
      VERIFYING: "verifying",
    });
  });
});
