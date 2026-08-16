export const defaults = {
  interruptible: true,
  minWords: 2,
  backchannels: [
    "yeah", "yep", "yes", "ok", "okay", "mhm", "mm", "hmm", "huh",
    "uh-huh", "right", "sure", "aha", "wow", "cool", "got it", "i see",
    "ja", "genau", "klar", "okay okay", "mhmm", "achso",
  ],
};

const bare = (text) => (text ?? "").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim();

export function isBackchannel(transcript, lexicon = defaults.backchannels) {
  const normalized = bare(transcript);
  if (!normalized) return true;
  if (lexicon.includes(normalized)) return true;
  const words = normalized.split(/\s+/);
  return words.length <= 2 && words.every((word) => lexicon.includes(word));
}

const wordCount = (transcript) => bare(transcript).split(/\s+/).filter(Boolean).length;

function barge(event, state, policy) {
  if (!state.speaking) return null;
  if (!policy.interruptible) return { act: "hold" };
  if (event.transcript === undefined) return { act: "arm" };
  if (isBackchannel(event.transcript, policy.backchannels)) return { act: "hold" };
  if (wordCount(event.transcript) < policy.minWords) return { act: "arm" };
  return { act: "yield" };
}

export function decide(state, event, options = {}) {
  const policy = { ...defaults, ...options };

  switch (event.nature) {
    case "turn.start": {
      const interruption = barge(event, state, policy);
      if (interruption) return { state: { ...state, armed: interruption.act === "arm" }, ...interruption };
      return { state: { ...state, armed: false }, act: "listen" };
    }
    case "partial": {
      if (state.speaking && (state.armed || policy.interruptible)) {
        const interruption = barge(event, state, policy);
        if (interruption?.act === "yield") return { state: { ...state, armed: false }, act: "yield" };
        if (interruption) return { state, ...interruption };
      }
      return { state, act: "listen" };
    }
    case "eager":
      return { state: { ...state, drafting: true }, act: "draft", transcript: event.transcript };
    case "resume":
      return { state: { ...state, drafting: false }, act: "scrap" };
    case "final":
      return {
        state: { ...state, armed: false, drafting: false },
        act: state.drafting ? "confirm" : "respond",
        transcript: event.transcript,
      };
    case "turn.end":
      return { state: { ...state, armed: false }, act: "settle" };
    default:
      return { state, act: "hold" };
  }
}

export function cursor(state = { characters: 0, pts: 0 }, packet) {
  if (packet.nature !== "packet") return state;
  const aligned = packet.align?.at(-1)?.offset;
  return {
    characters: aligned ?? state.characters + (packet.text?.length ?? 0),
    pts: packet.pts ?? state.pts,
  };
}

export function truncate(turn, characters) {
  let budget = characters;
  const parts = [];
  for (const part of turn.parts) {
    if (part.type !== "text") {
      parts.push(part);
      continue;
    }
    if (budget <= 0) continue;
    const kept = part.text.slice(0, budget);
    budget -= part.text.length;
    const boundary = budget < 0 ? kept.lastIndexOf(" ") : kept.length;
    parts.push({ ...part, text: kept.slice(0, boundary > 0 ? boundary : kept.length) });
  }
  return { ...turn, parts, meta: { ...turn.meta, state: "interrupted" } };
}
