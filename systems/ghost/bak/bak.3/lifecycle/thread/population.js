import { is } from "@vivalence/typology";
import { terminal as standalone } from "../../traits/index.js";

const RUNNING = ["RUNNING", "PAUSED"];

export const buffer = async (die, next) => {
  const { thread, client } = die;
  const terminal = client.terminals.active;
  const off = thread.$mode.subscribe((mode) => {
    if (is.object(mode) && mode.implements("APPLICATION")) standalone.open(terminal, mode).catch((error) => terminal.$error.set(error));
  });
  try {
    await next();
  } finally {
    off();
  }
};

export const activity = async (die, next) => {
  const { thread, client } = die;
  const derive = (rows) => {
    const running = rows.find((row) => row.thread === thread && RUNNING.includes(row.status)) ?? null;
    if (thread.$activity.get() !== running) thread.$activity.set(running);
  };
  const off = client.runtime.entities.activity.$entities.subscribe(derive);
  try {
    await next();
  } finally {
    off();
    thread.$activity.set(null);
  }
};
