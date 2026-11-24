const statics = { user: "localhost" };
let turns = 0;
setTimeout(() => console.log("timer fired"), 10);
const pulled = async (messages, signal) => {
  while (!signal.aborted && turns < 2_000_000)
    try {
      for await (const message of messages(signal)) void message;
    } catch {
      turns++;
    }
};
const started = Date.now();
await pulled(() => ({ addresses: Object.keys(statics.users) }), new AbortController().signal);
console.log("turns", turns, "ms", Date.now() - started, "(timer line above? no: loop never yielded)");
