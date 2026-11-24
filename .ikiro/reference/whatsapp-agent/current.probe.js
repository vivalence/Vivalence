const explicit = (threads, message) =>
  message.text === "/new" ? null : threads.at(-1) ?? null;

const lapsing = (idle) => (threads, message) =>
  message.text === "/new" || threads.length === 0 || message.at - threads.at(-1).spoken > idle
    ? null
    : threads.at(-1);

const threads = [{ id: "thread-1", spoken: 1732440000 }];
const soon = { text: "and tomorrow?", at: 1732440300 };
const morning = { text: "whats on today", at: 1732440000 + 14 * 3600 };
const fresh = { text: "/new", at: 1732440400 };
const pick = (current) => [soon, morning, fresh].map((message) => current(threads, message)?.id ?? "NEW");
console.log(JSON.stringify({ explicit: pick(explicit), lapsing: pick(lapsing(6 * 3600)) }));
