import { soma, v, Vector } from "@vivalence/typology";
import { BRIEF } from "./brief.js";

// the researcher's own budget — NOT the thread's INTELLIGENT.rounds, which is the OUTER
// conversation's per-turn tool cap and would starve a research pass if it were dialed low.
// two searches, six reads, a draw, a redraw, slack. the thread's tune IS inherited.
export const ROUNDS = 30;

// the harness IS the researcher: turns, the em fork, the armed catalog, persistence and the
// stream are all its job. an async generator out of here is auto-framed as SSE by http.js,
// which is also what exempts the call from the connection's request timeout.
export const investigate = async (ctx) =>
  ctx.mode.harness.dialogue.stream({
    thread: ctx.thread ?? ctx.input?.thread,
    parts: [{ type: "text", text: ctx.input.brief }],
    system: { brief: BRIEF },
    config: { rounds: ROUNDS },
  });

export const research = new Vector().open(
  {
    nature: "/research",
    valence:
      "Research a subject and leave a page about it on the operator's screen. It searches " +
      "Wikipedia, opens the article and follows its links to the neighbours that matter, and " +
      "draws a report into a buffer the operator can click open in the chat. It returns what " +
      "it learned, so you can answer from it directly; the page is already on screen by then. " +
      "Use this when the operator wants to KEEP something. For a single fact, call web_search " +
      "yourself. It costs a minute and several model calls — one call per subject, not one per " +
      "question. If it comes back with condition ERROR and a buffer, the page IS on screen and " +
      "the researcher stopped before summarising: answer from the page, and treat `message` as " +
      "partial.",
    input: v.object({
      brief: v
        .string()
        .desc(
          "The whole brief, in prose. Name what to research, who is asking, what they already " +
            "know, and any angle the page should take. Example: 'Flamingos, for an operator " +
            "new to this demo who knows no biology. Cover taxonomy, the six species, and why " +
            "they are pink and stand on one leg.'",
        ),
    }),
  },
  // a tool result cannot stream, so this door folds the same records the app door yields.
  async (ctx) => {
    let folded = null;
    for await (const record of await investigate(ctx)) {
      folded = soma.transcript(folded, record);
    }

    // PROJECT. the fold concats EVERY non-message key of every tool result — url[], title[],
    // chars[], markdown[], links[], results[] — and only message + buffer leave.
    const { message, buffer = [] } = folded.output;
    const { state, rounds, fault } = folded.meta ?? {};
    if (folded.condition === "NOMINAL") {
      return {
        condition: "NOMINAL",
        message: message ??
          "the researcher drew the page and said nothing about it",
        buffer,
      };
    }
    return {
      condition: "ERROR",
      message:
        `the researcher stopped early — ${state} after ${rounds} rounds` +
        (fault?.message ? ` (${fault.message})` : "") +
        (buffer.length
          ? `, but it drew ${buffer.length} page${
            buffer.length === 1 ? "" : "s"
          } first; answer from what is on screen`
          : ", and drew nothing") +
        (message ? `. Its last words: ${message}` : "."),
      buffer,
    };
  },
);
