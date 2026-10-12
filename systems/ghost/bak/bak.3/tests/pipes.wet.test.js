import { specimen } from "@vivalence/typology";
import { join } from "@std/path";
import { boot, DEMO } from "./scenarios/hello.js";
import { lines, spawn, viva } from "./subprocess.js";

const { describe, it, beforeAll, afterAll, expect } = specimen;

describe("the shell and the repl over pipes — the hello scenario is the runtime", () => {
  let world;
  beforeAll(async () => {
    world = await boot({ prefix: "viva-pipes-" });
  });
  afterAll(async () => {
    await world.stop();
  });

  it("viva --help lists every shell nature, exit 0", async () => {
    const held = await viva(["--help"], { cwd: join(world.root, "instance"), env: world.env });
    expect(held.code).toBe(0);
    for (const nature of ["ledger/install", "ledger/doctor", "instance/clone", "instance/up", "instance/down", "registry/tap", "client/repl", "client/chrome"]) expect(held.out).toContain(nature);
  });

  it("viva typo exits 127 naming the verb", async () => {
    const held = await viva(["typo"], { cwd: join(world.root, "instance"), env: world.env });
    expect(held.code).toBe(127);
    expect(held.err).toContain("/typo: no such verb");
  });

  it("viva --json ledger/doctor prints one json document, exit 0", async () => {
    const held = await viva(["--json", "ledger/doctor"], { cwd: join(world.root, "instance"), env: world.env });
    expect(held.code).toBe(0);
    expect(Object.keys(JSON.parse(held.out))).toContain("homes");
  });

  it("a pipe into bare viva is the repl: /--help answers a listing line, /quit stops the client, exit 0", async () => {
    const held = await viva([], { cwd: join(world.root, "instance"), env: world.env, stdin: "/--help\n/quit\n" });
    expect(held.code).toBe(0);
    expect(held.lines.length).toBe(1);
    const [listing] = held.json;
    expect(Object.keys(listing)).toEqual(["listing"]);
    expect(listing.listing.groups.map((group) => group.title)).toContain("quit");
  });

  it("a bare line, a typo and a key each answer one output line, a blank line answers nothing; the client never dies on a line", async () => {
    const held = await viva(["client/repl"], { cwd: join(world.root, "instance"), env: world.env, stdin: "ciao\n\n   \n/typo\n/dock/full\n/quit\n" });
    expect(held.code).toBe(0);
    expect(held.json).toEqual([
      { output: { refused: "/*", fault: "no terminal picked — /terminal/new" } },
      { output: { refused: "/typo", fault: "/typo: no such verb — /--help" } },
      { output: { side: "right", share: 0.32, collapsed: true, full: true } },
    ]);
  });

  it("EOF without /quit stops the client, exit 0", async () => {
    const held = await viva([], { cwd: join(world.root, "instance"), env: world.env, stdin: "/daemon\n" });
    expect(held.code).toBe(0);
    expect(held.json).toEqual([{ output: [] }]);
  });
});

describe("the demo over the repl pipe — autologin, memo seated by hand, one turn to the Magister", () => {
  let world;
  beforeAll(async () => {
    world = await boot({ recipe: DEMO, prefix: "viva-demo-" });
  });
  afterAll(async () => {
    await world.stop();
  });

  it("waits for the daemons like a typist would, then a terminal, a memo thread, a line with one review round, /quit — one json line each", async () => {
    const child = spawn(["client/repl"], { cwd: join(world.root, "instance"), env: world.env, stdin: "piped", stderr: "null" });
    const writer = child.stdin.getWriter();
    const answers = [];
    const reading = lines(child.stdout, (line) => answers.push(JSON.parse(line).output));
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

    const healthy = (daemons) => daemons.length === 2 && daemons.every((daemon) => daemon.status === "HEALTHY");
    let daemons = await say("/daemon");
    while (!healthy(daemons)) daemons = await say("/daemon");
    expect(daemons.map((daemon) => [daemon.reference, daemon.modes]).sort()).toEqual([["/daemon/hello", 1], ["/daemon/memo", 3]]);
    const terminal = await say("/terminal/new");
    expect(Object.keys(terminal)).toEqual(["terminal"]);
    const seated = await say("/thread/new /daemon/memo/mode/srs/memo");
    expect(seated.mode).toBe("/daemon/memo/mode/srs/memo");
    const replied = await say("salve --tool review");
    expect([replied.message, replied.object.cards[0].slug]).toEqual(["[stub] salve", "deus.noun"]);
    await writer.write(new TextEncoder().encode("/quit\n"));
    await writer.close();
    expect((await child.status).code).toBe(0);
    await reading;
  });
});
