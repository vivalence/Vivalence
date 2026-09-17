import { specimen } from "@vivalence/typology";
import { metronome } from "@vivalence/typology/scenarios";
import { consumer, until } from "./activity/client.js";

const { ledger } = metronome;
const RUNTIME = new URL("../../../runtime/", import.meta.url).pathname; //@beef there is tooling in paladin for this. isntance.runtime or so.

async function spawn(tick) {
  const child = new Deno.Command("deno", {
    args: ["run", "-A", "--no-check", "tests/interactive/activity/daemon.js", "--port", "0", "--tick", String(tick), "--cron", "--silent"],
    cwd: RUNTIME,
    stdout: "piped",
    stderr: "null",
  }).spawn();
  const reader = child.stdout.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let url = null;
  let fixtures = null;
  const pump = (async () => {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += value;
      const parts = buffer.split("\n");
      buffer = parts.pop();
      for (const line of parts) {
        if (line.startsWith("READY ")) url = line.slice(6).trim();
        if (line.startsWith("FIXTURES ")) fixtures = JSON.parse(line.slice(9));
      }
    }
  })();
  await until(() => url && fixtures, 20000);
  return {
    child,
    url,
    fixtures,
    kill: async () => {
      child.kill("SIGTERM");
      await child.status;
      await pump;
    },
  };
}

specimen.describe("activity — two processes, the dossier path", () => {
  let daemon, client;
  specimen.beforeAll(async () => {
    daemon = await spawn(150);
    client = await consumer(daemon.url, daemon.fixtures.tokens.user);
  });
  specimen.afterAll(async () => {
    await client.close();
    await daemon.kill();
  });

  specimen.it("the client sees every state of the daemon's cron in order, holds and ends one of them through row.stdin, and never gets a write", async () => {
    const roster = ledger(client.repository);
    await client.repository.find();
    client.repository.subscribe();
    const whole = () => roster.rows.find((frame) => frame.op === "create" && frame.status === "IDLE");
    await until(() => whole() && roster.rows.some((frame) => frame.op === "delete" && frame.id === whole().id), 20000);
    const first = whole().id;
    specimen.expect(roster.walk(first)).toEqual(["create", "RUNNING", "DONE", "delete"]);
    specimen.expect(roster.rows.some((frame) => frame.id === first && frame.last?.startsWith("/hallucination/lookup/object"))).toBe(true);

    const seen = new Set(roster.rows.map((frame) => frame.id));
    await until(() => client.repository.$entities.get().some((row) => !seen.has(row.id)), 20000);
    const row = client.repository.$entities.get().find((held) => !seen.has(held.id));
    specimen.expect(typeof row.stdin.SIGSTOP).toBe("function");
    const stdout = [];
    const reading = (async () => {
      for await (const record of await row.stdout()) stdout.push(record);
    })();
    await until(() => row.status === "RUNNING", 20000);
    const paused = await row.stdin.SIGSTOP();
    specimen.expect(paused.code).toBe("PAUSED");
    await until(() => row.status === "PAUSED");
    specimen.expect(client.repository.findOneLocal({ id: row.id })).toBe(row);
    specimen.expect(row.toJSON()).not.toHaveProperty("stdin");
    await row.stdin.SIGCONT();
    await row.stdin.SIGTERM("user pressed stop");
    await until(() => !client.repository.findOneLocal({ id: row.id }), 20000);
    specimen.expect(roster.walk(row.id).slice(-5)).toEqual(["PAUSED", "RUNNING", "STOPPING", "STOPPED", "delete"]);
    await reading;
    specimen.expect(stdout[0]).toMatchObject({ path: "/hallucination", verb: "note", data: { activity: row.id } });
    specimen.expect(stdout.slice(-3).map((record) => record.verb)).toEqual(["resume", "stop", "close"]);
    specimen.expect(stdout.length).toBeGreaterThan(row.steps.length);
    specimen.expect(row.toJSON()).not.toHaveProperty("stdout");
    specimen.expect(roster.rows.findLast((frame) => frame.id === row.id && frame.op === "update").error).toBe("STOPPED");

    await specimen.expect(client.repository.create({ user: daemon.fixtures.user, mode: daemon.fixtures.mode })).rejects.toThrow();
    await specimen.expect(client.repository.removeOne({ id: row.id })).rejects.toThrow();
    specimen.expect(row.stdin.SIGHUP).toBe(undefined);
    const stranger = await consumer(daemon.url, daemon.fixtures.tokens.stranger);
    await specimen.expect(stranger.repository.find()).resolves.toEqual([]);
    await stranger.close();
    roster.off();
  });
});
