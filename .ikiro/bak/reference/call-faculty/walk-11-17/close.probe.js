const grown = (part, carried) => {
  for (const [key, value] of Object.entries(carried))
    part[key] = typeof value === "string" && typeof part[key] === "string" ? part[key] + value : value;
  return part;
};
const TURN = {
  open: (turn, carried) => ({ ...carried, parts: [] }),
  close: (turn, carried) => ({ ...turn, ...carried }),
  full: (turn, carried) => carried,
};
const PART = {
  open: (part, carried) => ({ ...carried }),
  delta: grown,
  close: (part) => part,
};

function locked(turn, packet) {
  const [, noun, act] = packet.event.split("/");
  if (noun === "turn") return TURN[act](turn, packet.turn);
  turn.parts[packet.index] = PART[act](turn.parts[packet.index], packet.part);
  return turn;
}

const NOUN = {
  turn: (turn, act, packet) => TURN[act](turn, packet.turn),
  part: (turn, act, packet) => {
    turn.parts[packet.index] = PART[act](turn.parts[packet.index], packet.part);
    return turn;
  },
  response: (turn) => turn,
};
function fixed(turn, packet) {
  const [, noun, act] = packet.event.split("/");
  return NOUN[noun](turn, act, packet);
}

function transcript(state, record) {
  const current = state ?? { open: null, condition: null, turns: [], product: {}, meta: undefined };
  switch (record.event) {
    case "/turn/open":
      return { ...current, open: fixed(null, record) };
    case "/turn/close":
      return { ...current, turns: [...current.turns, fixed(current.open, record)], open: null };
    case "/response/close":
      return {
        ...current,
        ...record.response,
        condition: record.response.meta.state === "complete" ? "NOMINAL" : "ERROR",
      };
    default:
      return { ...current, open: fixed(current.open, record) };
  }
}

const spoke = [
  { event: "/turn/open", turn: { role: "assistant" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, part: { text: "ciao means hello" } },
  { event: "/part/close", index: 0, part: {} },
  { event: "/turn/close", turn: { meta: { state: "complete", usage: { input: 71, output: 6 } } } },
  { event: "/response/close", response: { meta: { state: "complete", usage: { input: 71, output: 6 }, rounds: 1 } } },
];
const failed = [
  { event: "/response/close", response: { meta: { state: "error", rounds: 1, fault: { kind: "auth", message: "invalid x-api-key" } } } },
];

const live = (pour, packets) => {
  let turn = null;
  try {
    for (const packet of packets) turn = pour(turn, structuredClone(packet));
    return { turn, keys: turn ? Object.keys(turn.parts) : null };
  } catch (error) {
    return { threw: `${error.constructor.name}: ${error.message}` };
  }
};
console.log("=== ghost's live fold (systems/ghost/gestalten/belt/harness.js:6) under Q24's pour, a spoken answer:", JSON.stringify(live(locked, spoke)));
console.log("=== the same, a key fault before any turn opened:", JSON.stringify(live(locked, failed)));
console.log("=== with the noun table, spoken:", JSON.stringify(live(fixed, spoke)));
console.log("=== with the noun table, the fault:", JSON.stringify(live(fixed, failed)));
console.log("=== soma.transcript over the spoken answer\n" + JSON.stringify(spoke.reduce(transcript, null), null, 2));
console.log("=== soma.transcript over the fault\n" + JSON.stringify(failed.reduce(transcript, null), null, 2));
