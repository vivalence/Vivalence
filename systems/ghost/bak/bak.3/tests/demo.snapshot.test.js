import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { boot, DEMO } from "./scenarios/hello.js";
import { lines, spawn } from "./subprocess.js";

const { describe, it, beforeAll, afterAll, expect } = specimen;

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    Deno.mkdirSync(SNAPSHOTS, { recursive: true });
    specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  }
  expect(pojo).toEqual(JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file))));
  return pojo;
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
const ISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g;

const normalizer = (world) => {
  const seen = new Map();
  const named = (id) => {
    if (!seen.has(id)) seen.set(id, `<id:${seen.size}>`);
    return seen.get(id);
  };
  return (value) =>
    JSON.parse(
      JSON.stringify(value)
        .replaceAll(world.origin, "<origin>")
        .replaceAll(world.root, "<world>")
        .replace(UUID, named)
        .replace(ISO, "<iso>"),
    );
};

const SCRIPT = [
  "/--help",
  "/modes",
  "/terminal",
  "/dock --help",
  "salve --tool session",
  "salve --tool progress",
  "salve --tool explain",
  "salve --tool review",
  "/thread/new /daemon/hello/mode/demo/hello-world",
  "/terminal",
  "/typo",
  "/thread --help",
  "modes",
  "thread new /daemon/memo/mode/srs/memo",
  "terminal",
  "doctor",
  "quit smoking is hard",
  "help me with deus",
];

describe("the demo session, replayed — DEMO's world, the repl over a pipe, one scripted line after another", () => {
  let world;
  beforeAll(async () => {
    world = await boot({ recipe: DEMO, prefix: "viva-demo-snapshot-" });
  });
  afterAll(async () => {
    await world.stop();
  });

  it("signed in by AUTOLOGIN, seated at home on the Magister, every line answered the same way every run", async () => {
    const child = spawn(["client/repl"], { cwd: join(world.root, "instance"), env: world.env, stdin: "piped", stderr: "null" });
    const writer = child.stdin.getWriter();
    const answers = [];
    const reading = lines(child.stdout, (line) => answers.push(JSON.parse(line)));
    const say = async (line) => {
      const before = answers.length;
      await writer.write(new TextEncoder().encode(`${line}\n`));
      const deadline = Date.now() + 60_000;
      while (answers.length === before) {
        if (Date.now() > deadline) throw new Error(`no answer to ${line}`);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return answers.at(-1);
    };

    const healthy = (held) => Array.isArray(held.output) && held.output.length === 2 && held.output.every((daemon) => daemon.status === "HEALTHY");
    while (!healthy(await say("/daemon")));
    const seated = (held) => Array.isArray(held.output) && held.output.length === 1 && held.output[0].thread !== null;
    while (!seated(await say("/terminal")));

    const normalized = normalizer(world);
    const session = [{ line: "/daemon", answer: normalized(await say("/daemon")) }];
    for (const line of SCRIPT) session.push({ line, answer: normalized(await say(line)) });
    await writer.write(new TextEncoder().encode("/quit\n"));
    await writer.close();
    expect((await child.status).code).toBe(0);
    await reading;

    const pinned = pin(session, "ghost-demo-session.snapshot.json");
    expect(pinned.find((step) => step.line === "salve --tool session").answer.output.object.dealt).toBe(10);
  });
});
