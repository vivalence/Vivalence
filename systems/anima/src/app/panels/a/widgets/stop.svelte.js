import { untrack } from "svelte";
import { owed } from "@vivalence/anima";

export function stopper(read, { hold = 2000 } = {}) {
  let armed = $state(null);
  let holding = $state(0);
  let holder = null;
  const signalled = new Set();

  function release() {
    clearInterval(holder);
    holder = null;
    holding = 0;
  }

  function disarm() {
    release();
    armed = null;
    signalled.clear();
  }

  function stop() {
    if (armed !== "SIGKILL") armed = "SIGTERM";
  }

  function press() {
    stop();
    clearInterval(holder);
    const started = performance.now();
    holder = setInterval(() => {
      holding = Math.min(1, (performance.now() - started) / hold);
      if (holding < 1) return;
      release();
      armed = "SIGKILL";
    }, 40);
  }

  $effect(() => {
    if (!armed) return;
    const reason = armed === "SIGKILL" ? "user held stop" : "user pressed stop";
    for (const row of owed(armed, read().activities, signalled)) row.stdin[armed](reason);
  });

  $effect(() => {
    const { activities, sending } = read();
    if (armed && !sending && !activities.length) untrack(disarm);
  });

  return {
    get armed() {
      return armed;
    },
    get holding() {
      return holding;
    },
    stop,
    press,
    release,
    disarm,
  };
}
