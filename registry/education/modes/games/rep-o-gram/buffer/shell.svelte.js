export const journal = $state({ narration: [], dispatches: [], chat: [], shell: null });

const stamp = () =>
  new Date().toLocaleTimeString("en-GB", { hour12: false }).slice(3);

export function say(head, body, tone = "support") {
  journal.narration = [{ head, body, tone, at: stamp() }, ...journal.narration].slice(0, 40);
}

export function dispatched(label, signal) {
  journal.dispatches = [{ label, signal, at: stamp() }, ...journal.dispatches].slice(0, 60);
}

export function spoke(who, text) {
  journal.chat = [...journal.chat, { who, text }].slice(-24);
}
