import { specimen } from "@vivalence/typology";
import { fire, parts, screen } from "../scenarios/index.js";
import { oracle, shape } from "./oracle.js";

const call = { name: "match_move", argument: "e2e4" };

const CONSENT = `<div class="consent" role="group" aria-label="consent"><span class="q">?</span><span>approve</span><span class="call">match_move e2e4</span><span class="keys"><button data-signal="/approve"><b>y</b>approve</button><button data-signal="/skip"><b>n</b>skip</button><button data-signal="/edit"><b>e</b>edit</button></span></div>`;

specimen.describe("Consent — the design's .consent row (dom.js:282); y · n · e are bindings", () => {
  specimen.it("names the call and offers the three keys as buttons", () => {
    const rig = screen(() => parts.Consent({ call }));
    specimen.expect(shape(rig.target)).toBe(oracle(CONSENT));
    rig.close();
  });

  specimen.it("a key or a click sends the call to its handler; other keys pass", () => {
    const sent = [];
    const rig = screen(() =>
      parts.Consent({ call, onApprove: (held) => sent.push(["approve", held.name]), onSkip: () => sent.push(["skip"]), onEdit: () => sent.push(["edit"]) }),
    );
    const consent = rig.target.querySelector(".consent");
    fire(consent, "keydown", { key: "y" });
    fire(consent, "keydown", { key: "n" });
    fire(consent, "keydown", { key: "e" });
    const passed = fire(consent, "keydown", { key: "x" });
    specimen.expect(passed.defaultPrevented).toBe(false);
    fire(consent.querySelectorAll("button")[0], "click");
    specimen.expect(sent).toEqual([["approve", "match_move"], ["skip"], ["edit"], ["approve", "match_move"]]);
    rig.close();
  });

  specimen.it("binds y n e", () => {
    specimen.expect(parts.CONSENT_KEYS).toEqual({ y: "onApprove", n: "onSkip", e: "onEdit" });
  });
});
