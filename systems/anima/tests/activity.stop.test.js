import { specimen } from "@vivalence/typology";
import { compileModule } from "svelte/compiler";
import { atom } from "nanostores";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const ACTIVITY = new URL("../src/typology/entities/activity.js", import.meta.url).href;
const SOURCE = new URL("../src/app/panels/a/widgets/stop.svelte.js", import.meta.url);

const HOLD = 300;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const row = (id, status) => {
  const signals = [];
  return {
    id,
    status,
    signals,
    stdin: {
      SIGTERM: (input) => Promise.resolve(void signals.push(["SIGTERM", input])),
      SIGKILL: (input) => Promise.resolve(void signals.push(["SIGKILL", input])),
    },
  };
};

specimen.describe("dock stop — a press is SIGTERM to every live row on the thread, a hold is SIGKILL", () => {
  let dir, runtime, stopper;
  specimen.beforeAll(async () => {
    dir = await Deno.makeTempDir({ prefix: "anima-stop-" });
    const out = compileModule(await Deno.readTextFile(SOURCE), { generate: "client", dev: true, filename: "stop.svelte.js" });
    const code = out.js.code
      .replace(/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, "")
      .replace(/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`)
      .replace(/from "svelte"/g, `from "${ENTRY}"`)
      .replace(/from "@vivalence\/anima"/g, `from "${ACTIVITY}"`);
    await Deno.writeTextFile(`${dir}/stop.js`, code);
    runtime = await import(CLIENT);
    ({ stopper } = await import(`file://${dir}/stop.js`));
  });
  specimen.afterAll(() => Deno.remove(dir, { recursive: true }));

  const rig = () => {
    const { effect_root, flush, get, set, state } = runtime;
    const activities = state([]);
    const sending = state(true);
    let control;
    const dumps = [];
    const quiet = console.error;
    console.error = (...args) => dumps.push(String(args[0]));
    const stop = effect_root(() => {
      control = stopper(() => ({ activities: get(activities), sending: get(sending) }), { hold: HOLD });
    });
    flush();
    return {
      control,
      rows: (next) => (set(activities, next), flush()),
      sending: (next) => (set(sending, next), flush()),
      flush,
      close: () => {
        stop();
        console.error = quiet;
        return dumps;
      },
    };
  };

  specimen.it("a press reaches RUNNING and PAUSED rows at once; an IDLE row takes it when it opens, a row minted mid-stop on arrival, and nobody twice", async () => {
    const drive = rig();
    const running = row("a", "RUNNING");
    const idle = row("b", "IDLE");
    const paused = row("c", "PAUSED");
    drive.rows([running, idle, paused]);

    drive.control.press();
    drive.control.release();
    drive.flush();
    specimen.expect(drive.control.armed).toBe("SIGTERM");
    specimen.expect([running.signals, idle.signals, paused.signals]).toEqual([[["SIGTERM", "user pressed stop"]], [], [["SIGTERM", "user pressed stop"]]]);

    running.status = "STOPPING";
    idle.status = "RUNNING";
    const late = row("d", "RUNNING");
    drive.rows([running, idle, paused, late]);
    specimen.expect(idle.signals).toEqual([["SIGTERM", "user pressed stop"]]);
    specimen.expect(late.signals).toEqual([["SIGTERM", "user pressed stop"]]);
    specimen.expect([running, idle, paused, late].map((held) => held.signals.length)).toEqual([1, 1, 1, 1]);

    await wait(HOLD + 100);
    drive.flush();
    specimen.expect(running.signals.some(([signal]) => signal === "SIGKILL")).toBe(false);
    specimen.expect(drive.close()).toEqual([]);
  });

  specimen.it("holding past the hold sends SIGKILL to every live row, STOPPING included; a row minted after the kill is killed on arrival", async () => {
    const drive = rig();
    const stuck = row("a", "STOPPING");
    const idle = row("b", "IDLE");
    drive.rows([stuck, idle]);

    drive.control.press();
    await wait(HOLD / 2);
    drive.flush();
    specimen.expect(drive.control.holding > 0 && drive.control.holding < 1).toBe(true);
    specimen.expect(drive.control.armed).toBe("SIGTERM");
    specimen.expect(stuck.signals).toEqual([]);

    await wait(HOLD);
    drive.flush();
    specimen.expect(drive.control.armed).toBe("SIGKILL");
    specimen.expect(drive.control.holding).toBe(0);
    specimen.expect(stuck.signals).toEqual([["SIGKILL", "user held stop"]]);
    specimen.expect(idle.signals).toEqual([["SIGKILL", "user held stop"]]);

    drive.control.release();
    drive.control.press();
    drive.flush();
    specimen.expect(drive.control.armed).toBe("SIGKILL");

    const late = row("c", "IDLE");
    drive.rows([stuck, idle, late]);
    specimen.expect(late.signals).toEqual([["SIGKILL", "user held stop"]]);
    specimen.expect(drive.close()).toEqual([]);
  });

  specimen.it("it disarms once nothing is sending and the thread is quiet — the next run is not stopped", () => {
    const drive = rig();
    const first = row("a", "RUNNING");
    drive.rows([first]);
    drive.control.press();
    drive.control.release();
    drive.flush();
    specimen.expect(first.signals.length).toBe(1);

    drive.rows([]);
    specimen.expect(drive.control.armed).toBe("SIGTERM");
    drive.sending(false);
    specimen.expect(drive.control.armed).toBe(null);

    drive.sending(true);
    const next = row("b", "RUNNING");
    drive.rows([next]);
    specimen.expect(next.signals).toEqual([]);
    specimen.expect(drive.close()).toEqual([]);
  });

  specimen.it("a send disarms at once, even with a stuck row still on the thread", () => {
    const drive = rig();
    const stuck = row("a", "RUNNING");
    drive.rows([stuck]);
    drive.control.press();
    drive.control.release();
    drive.flush();
    stuck.status = "STOPPING";
    drive.rows([stuck]);
    drive.control.disarm();
    drive.flush();
    specimen.expect(drive.control.armed).toBe(null);
    const fresh = row("b", "RUNNING");
    drive.rows([stuck, fresh]);
    specimen.expect(fresh.signals).toEqual([]);
    specimen.expect(drive.close()).toEqual([]);
  });
});
