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

export async function* harmonize(packets, options = {}) {
  const { window, tolerance, tail } = { ...defaults, ...options };
  let committed = 0;
  let ring = [];

  const reset = () => {
    committed = 0;
    ring = [];
  };

  for await (const packet of packets) {
    switch (packet.event) {
      case "/turn/open":
      case "/turn/close": {
        reset();
        yield packet;
        break;
      }
      case "/part/draft": {
        const hypothesis = tokens(packet.part.text);
        ring = [...ring, hypothesis].slice(-window);
        const reached = ring.length === window ? frontier(ring, committed, tolerance) : committed;
        if (reached > committed) {
          yield {
            event: "/part/delta",
            index: packet.index,
            part: { text: hypothesis.slice(committed, reached).join(" ") + " " },
          };
        }
        committed = reached;
        yield {
          event: "/part/draft",
          index: packet.index,
          part: { text: hypothesis.slice(committed).slice(-tail).join(" ") },
        };
        break;
      }
      case "/part/delta": {
        const remainder = tokens(packet.part.text).slice(committed);
        if (remainder.length) yield { ...packet, part: { text: remainder.join(" ") + " " } };
        reset();
        break;
      }
      default:
        yield packet;
    }
  }
}
