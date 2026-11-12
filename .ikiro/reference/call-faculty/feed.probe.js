import { Pipe } from "@vivalence/typology";

const pipe = new Pipe();
const feed = new AbortController();
const seen = [];
const drained = (async () => {
  try {
    for await (const samples of pipe.drain(feed.signal)) seen.push(samples);
    return "returned";
  } catch (error) {
    return `threw ${error.name}`;
  }
})();
await Promise.resolve();
pipe.send(1);
pipe.send(2);
await new Promise((resolve) => setTimeout(resolve, 5));
pipe.send(3);
feed.abort();
pipe.send(4);
console.log(JSON.stringify({ end: await drained, seen, listeners: pipe.listeners.size }, null, 2));
