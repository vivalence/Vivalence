import { Queue, Signal, steer, Vector } from "@vivalence/typology";

const inbox = new Queue();

const attachment = new Vector().open("/webhook", (ctx) => {
  inbox.enqueue(ctx.input);
});

const provider = () => ({
  messages: (signal) => inbox.drain(signal),
});

const heard = { personal: [], second: [] };
const listen = async (name, signal) => {
  for await (const message of provider().messages(signal)) heard[name].push(message.text);
  return "ended";
};

const hook = (text) => steer.dispatch.execute(attachment, { input: { text } }, new Signal("/webhook"));

await hook("before any mode listens");
const stop = new AbortController();
const personal = listen("personal", stop.signal);
const second = listen("second", stop.signal);
for (const text of ["one", "two", "three", "four"]) {
  await hook(text);
  await new Promise((resolve) => setTimeout(resolve, 5));
}
stop.abort();
console.log(JSON.stringify({ heard, ended: await Promise.all([personal, second]), left: inbox.depth }));
