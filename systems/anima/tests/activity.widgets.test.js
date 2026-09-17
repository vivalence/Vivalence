import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { effect_root, flush, get, set, state, untrack, user_effect } from "svelte/internal/client";
import { atom } from "nanostores";
import { flat, project, root, spans } from "../src/app/panels/f/widgets/activity.js";
import { loudest, owed } from "../src/typology/entities/activity.js";

const WIDGETS = ["app/widgets/ActivityTracker", "app/panels/f/widgets/ActivityRow", "app/panels/f/widgets/ActivitySection"];

// the surfaces the widgets landed on. they carry warnings older than this quest
// (shoulder's ".population > *"), so the bar here is: it compiles, and nothing it says is ours.
const MOUNTED = ["app/panels/f/f", "app/bones/shoulder/shoulder", "app/panels/a/widgets/Dock"];

const source = (part) => Deno.readTextFile(new URL(`../src/${part}.svelte`, import.meta.url));

// a wire activity as the client receives it: status, error, and the ring of records. path,
// elapsed and the span bars exist NOWHERE on the wire — they are folded off the ring.
const RING = [
  { span: 1, trace: null, path: "/hallucination", verb: "open", at: 1000 },
  { span: 2, trace: 1, path: "/hallucination/lookup", verb: "open", at: 1400, data: { input: {} } },
  { span: 3, trace: 2, path: "/hallucination/lookup/object", verb: "open", at: 1600 },
  { span: 3, trace: 2, path: "/hallucination/lookup/object", verb: "close", at: 2600 },
  { span: 2, trace: 1, path: "/hallucination/lookup", verb: "close", at: 2800 },
  { span: 1, trace: null, path: "/hallucination", verb: "pause", at: 4000 },
];

specimen.describe("activity widgets — they compile, and the fold is the wire's own data", () => {
  for (const widget of WIDGETS) {
    specimen.it(`${widget}.svelte compiles without warnings`, async () => {
      const out = compile(await source(widget), { generate: "client", runes: true, filename: `${widget}.svelte` });
      specimen.expect(out.js.code.length > 0).toBe(true);
      specimen.expect(out.warnings.map((warning) => `${warning.code}: ${warning.message}`)).toEqual([]);
    });
  }

  for (const widget of MOUNTED) {
    specimen.it(`${widget}.svelte still compiles with the tracker mounted`, async () => {
      const out = compile(await source(widget), { generate: "client", runes: true, filename: `${widget}.svelte` });
      specimen.expect(out.js.code.length > 0).toBe(true);
      specimen.expect(out.warnings.filter((warning) => /Activity|tracker|activityRoster/i.test(warning.message))).toEqual([]);
    });
  }

  specimen.it("the row's path is the ROOT of the ring — a branch never becomes its own row", () => {
    specimen.expect(root(RING)).toBe("/hallucination");
    specimen.expect(spans(RING).map((span) => span.path)).toEqual([
      "/hallucination",
      "/hallucination/lookup",
      "/hallucination/lookup/object",
    ]);
  });

  specimen.it("a closed branch carries its end, the open root does not — that is what the bar draws", () => {
    const [held, branch, leaf] = spans(RING);
    specimen.expect(held.end).toBe(null);
    specimen.expect(branch.end - branch.start).toBe(1400);
    specimen.expect(leaf.end - leaf.start).toBe(1000);
  });

  specimen.it("the clock is the ring's, so a paused controller freezes it by marking nothing", () => {
    const paused = project({ id: "a", status: "PAUSED", steps: RING, error: null });
    specimen.expect(paused.elapsedLabel).toBe("3.0s");
    specimen.expect(project({ id: "a", status: "PAUSED", steps: RING, error: null }).elapsed).toBe(paused.elapsed);
  });

  specimen.it("the log is newest first, and a settled row is not live", () => {
    const held = project({ id: "a", status: "STOPPED", steps: RING, error: { code: "STOPPED", message: "user pressed stop" } });
    specimen.expect(held.steps[0].at).toBe(4000);
    specimen.expect(held.live).toBe(false);
    specimen.expect(held.errorMessage).toBe("user pressed stop");
    specimen.expect(held.ring).toBe("6/12");
  });

  specimen.it("the log's clock is relative to the oldest record shown, and a record's data reads as words", () => {
    const held = project({ id: "a", status: "STOPPED", steps: RING, error: { code: "STOPPED", message: "user pressed stop" } });
    specimen.expect(held.steps.map((step) => step.offset)).toEqual([3, 1.8, 1.6, 0.6, 0.4, 0]);
    specimen.expect(held.steps[4].summary).toBe("input {}");
    specimen.expect(held.errorMessage).toBe("user pressed stop");
    specimen.expect(flat({ round: 1, state: "complete", usage: { input: 10, output: 19 } })).toBe("round 1 · state complete · usage.input 10 · usage.output 19");
    specimen.expect(flat({ signal: "SIGTERM", reason: "user pressed stop" })).toBe("signal SIGTERM · reason user pressed stop");
    specimen.expect(flat(undefined)).toBe("");
  });

  specimen.it("an indicator shows the LOUDEST live state, never a settled one", () => {
    specimen.expect(loudest([{ status: "IDLE" }, { status: "RUNNING" }])).toBe("RUNNING");
    specimen.expect(loudest([{ status: "PAUSED" }, { status: "IDLE" }])).toBe("PAUSED");
    specimen.expect(loudest([{ status: "DONE" }])).toBe("NONE");
    specimen.expect(loudest([])).toBe("NONE");
  });

  specimen.it("a signal is owed only to rows the machine lets it move, and only once", () => {
    const rows = ["IDLE", "RUNNING", "PAUSED", "STOPPING", "DONE", "ABORTED"].map((status) => ({ id: status, status }));
    const sent = new Set();
    specimen.expect(owed("SIGTERM", rows, sent).map((row) => row.id)).toEqual(["RUNNING", "PAUSED"]);
    specimen.expect(owed("SIGTERM", rows, sent)).toEqual([]);
    specimen.expect(owed("SIGKILL", rows, sent).map((row) => row.id)).toEqual(["IDLE", "RUNNING", "PAUSED", "STOPPING"]);
    specimen.expect(owed("SIGHUP", rows)).toEqual([]);
  });
});

specimen.describe("activity section — the listener a store fires inside the subscribing effect is untracked", () => {
  const spin = (listener) => {
    const $entities = atom([]);
    const version = state(0);
    let runs = 0;
    const stop = effect_root(() => {
      user_effect(() => {
        runs += 1;
        return $entities.subscribe((held) => listener(version, held));
      });
    });
    const quiet = console.error;
    console.error = () => {};
    try {
      flush();
      return { runs, version: get(version) };
    } catch (error) {
      return { runs, error: error.message };
    } finally {
      console.error = quiet;
      stop();
    }
  };

  specimen.it("a listener that reads the state it writes re-runs the effect until svelte gives up", () => {
    const out = spin((version) => set(version, get(version) + 1));
    specimen.expect(out.runs).toBeGreaterThan(1000);
    specimen.expect(out.error).toContain("effect_update_depth_exceeded");
  });

  specimen.it("untracked, the same listener runs the effect once and counts one tick", () => {
    specimen.expect(spin((version) => untrack(() => set(version, get(version) + 1)))).toEqual({ runs: 1, version: 1 });
  });
});
