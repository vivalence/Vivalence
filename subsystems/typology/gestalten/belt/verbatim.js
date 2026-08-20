import { similarity } from "./string.js";

export const defaults = { window: 2, tolerance: 0.8, tail: 8 };

const bare = (word) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const agree = (a, b, tolerance) => {
  const left = bare(a);
  const right = bare(b);
  return left === right || similarity(left, right) >= tolerance;
};

const tokens = (transcript) => (transcript ?? "").trim().split(/\s+/).filter(Boolean);

function frontier(ring, committed, tolerance) {
  const limit = Math.min(...ring.map((hypothesis) => hypothesis.length));
  let index = committed;
  while (index < limit) {
    const anchor = ring.at(-1)[index];
    if (!ring.every((hypothesis) => agree(hypothesis[index], anchor, tolerance))) break;
    index += 1;
  }
  return index;
}

export async function* harmonize(events, options = {}) {
  const { window, tolerance, tail } = { ...defaults, ...options };
  let committed = 0;
  let ring = [];
  let segment = 0;

  const reset = () => {
    committed = 0;
    ring = [];
  };

  for await (const event of events) {
    switch (event.event) {
      case "/turn/open": {
        reset();
        yield event;
        break;
      }
      case "/verbatim/partial": {
        const hypothesis = tokens(event.transcript);
        ring = [...ring, hypothesis].slice(-window);
        if (ring.length === window) {
          const settled = frontier(ring, committed, tolerance);
          if (settled > committed) {
            yield { event: "/verbatim/commit", text: hypothesis.slice(committed, settled).join(" ") };
            committed = settled;
          }
        }
        yield { event: "/verbatim/partial", transcript: hypothesis.slice(committed).slice(-tail).join(" ") };
        break;
      }
      case "/verbatim/final": {
        const remainder = tokens(event.transcript).slice(committed);
        if (remainder.length) yield { event: "/verbatim/commit", text: remainder.join(" ") };
        yield { ...event, segment };
        segment += 1;
        reset();
        break;
      }
      case "/turn/close": {
        reset();
        yield event;
        break;
      }
      default:
        yield event;
    }
  }
}

const join = (...parts) => parts.filter(Boolean).join(" ");

export const empty = { settled: [], open: "", tail: "" };

export const transcript = (state) => join(...state.settled.map((entry) => entry.text), state.open);

export function fold(state = empty, event) {
  switch (event.event) {
    case "/turn/open":
      return { ...state, tail: "" };
    case "/verbatim/commit":
      return { ...state, open: join(state.open, event.text), tail: "" };
    case "/verbatim/partial":
      return { ...state, tail: event.transcript };
    case "/verbatim/final": {
      const entry = { id: event.segment, text: event.transcript, ...(event.words && { words: event.words }) };
      return { ...state, settled: [...state.settled, entry], open: "", tail: "" };
    }
    case "/verbatim/polish": {
      let anchored = false;
      const settled = state.settled.flatMap((entry) => {
        if (!event.segments.includes(entry.id)) return [entry];
        if (anchored) return [];
        anchored = true;
        return [{ id: entry.id, text: event.transcript }];
      });
      return anchored ? { ...state, settled } : state;
    }
    default:
      return state;
  }
}
