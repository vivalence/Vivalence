import { specimen, turn } from "@vivalence/typology";

const quiet = { speaking: false, armed: false, drafting: false };
const talking = { speaking: true, armed: false, drafting: false };

specimen.describe("belt.turn.decide — arbiter", () => {
  specimen.it("turn.start while quiet just listens", () => {
    const { act } = turn.decide(quiet, { nature: "turn.start" });
    specimen.expect(act).toBe("listen");
  });

  specimen.it("turn.start with real speech while agent talks yields the floor", () => {
    const { act } = turn.decide(talking, { nature: "turn.start", transcript: "wait stop that" });
    specimen.expect(act).toBe("yield");
  });

  specimen.it("backchannels never interrupt", () => {
    for (const transcript of ["yeah", "mhm", "ok okay", "genau"]) {
      const { act } = turn.decide(talking, { nature: "turn.start", transcript });
      specimen.expect(act).toBe("hold");
    }
  });

  specimen.it("transcript-less start while talking arms and waits for confirmation", () => {
    const first = turn.decide(talking, { nature: "turn.start" });
    specimen.expect(first.act).toBe("arm");
    const second = turn.decide(first.state, { nature: "partial", transcript: "actually hold on" });
    specimen.expect(second.act).toBe("yield");
  });

  specimen.it("a single short word arms rather than interrupts", () => {
    const { act } = turn.decide(talking, { nature: "turn.start", transcript: "wait" });
    specimen.expect(act).toBe("arm");
  });

  specimen.it("uninterruptible policy always holds", () => {
    const { act } = turn.decide(
      talking,
      { nature: "turn.start", transcript: "stop reading the disclosure" },
      { interruptible: false },
    );
    specimen.expect(act).toBe("hold");
  });

  specimen.it("eager drafts, resume scraps, final confirms the draft", () => {
    const drafted = turn.decide(quiet, { nature: "eager", transcript: "book it" });
    specimen.expect(drafted.act).toBe("draft");
    const scrapped = turn.decide(drafted.state, { nature: "resume" });
    specimen.expect(scrapped.act).toBe("scrap");
    const redrafted = turn.decide(scrapped.state, { nature: "eager", transcript: "book it for two" });
    const confirmed = turn.decide(redrafted.state, { nature: "final", transcript: "book it for two" });
    specimen.expect(confirmed.act).toBe("confirm");
  });

  specimen.it("final without a draft responds", () => {
    const { act } = turn.decide(quiet, { nature: "final", transcript: "what time is it" });
    specimen.expect(act).toBe("respond");
  });
});

specimen.describe("belt.turn — spoken cursor + truncation", () => {
  specimen.it("cursor advances by text length or alignment offset", () => {
    let state = turn.cursor(undefined, { nature: "packet", text: "hello " });
    state = turn.cursor(state, { nature: "packet", text: "world" });
    specimen.expect(state.characters).toBe(11);
    state = turn.cursor(state, { nature: "packet", align: [{ offset: 20 }] });
    specimen.expect(state.characters).toBe(20);
  });

  specimen.it("truncate cuts text parts at a word boundary and marks interrupted", () => {
    const spoken = turn.truncate(
      {
        role: "assistant",
        parts: [{ type: "text", text: "the plan is simple and elegant" }],
        meta: { state: "complete" },
      },
      17,
    );
    specimen.expect(spoken.parts[0].text).toBe("the plan is");
    specimen.expect(spoken.meta.state).toBe("interrupted");
  });

  specimen.it("truncate spans parts and drops unspoken ones", () => {
    const spoken = turn.truncate(
      {
        role: "assistant",
        parts: [
          { type: "text", text: "first part " },
          { type: "text", text: "second part" },
        ],
        meta: {},
      },
      11,
    );
    specimen.expect(spoken.parts.length).toBe(1);
    specimen.expect(spoken.parts[0].text).toBe("first part ");
  });
});
