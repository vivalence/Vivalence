import { steer, Twitch } from "@vivalence/typology";

const mode = new Twitch().open("/after/message/receive", async (ctx) => {
  await new Promise((resolve) => setTimeout(resolve, 50));
  ctx.input.seen.push(ctx.input.text);
  return { thread: "thread-1" };
});

const input = { seen: [], text: "hi" };
const started = performance.now();
const returned = await mode.dispatch("/after/message/receive", input);
const report = { returned, waited: performance.now() - started >= 50, input };

const [effect] = steer.dispatch.shotgun(mode, "/after/message/receive");
report.underneath = await effect({ seen: [], text: "hi" });

const failing = new Twitch().open("/after/message/receive", () => {
  throw new Error("mode refused");
});
report.thrown = await failing.dispatch("/after/message/receive", {}).then(
  () => null,
  (error) => error.message,
);
report.unheard = await new Twitch().dispatch("/after/message/receive", {}).then(
  () => "silent",
  (error) => error.message,
);
console.log(JSON.stringify(report));
