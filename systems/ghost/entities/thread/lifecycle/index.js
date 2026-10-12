import { Vector, shard } from "@vivalence/typology";

const RUNNING = ["RUNNING", "PAUSED"];

export const activity = async (threadDie, next) => {
  const derive = (rows) => {
    const running = rows.find((row) => row.thread === threadDie.thread && RUNNING.includes(row.status)) ?? null;
    if (threadDie.thread.$activity.get() !== running) threadDie.thread.$activity.set(running);
  };
  const off = threadDie.client.runtime.entities.activity.$entities.subscribe(derive);
  try {
    await next();
  } finally {
    off();
    threadDie.thread.$activity.set(null);
  }
};

export const execution = new Vector().use(activity).do(shard.controller.hold);
