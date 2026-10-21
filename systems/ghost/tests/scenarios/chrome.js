import { boot, DEMO } from "./hello.js";

const REPOSITORY = new URL("../../../../", import.meta.url).pathname;

const CARRIED = ["PATH", "DENO_DIR", "TMPDIR", "LANG"];

const QUIT = "\\x16q";

const SCRIPT = `
set timeout 90
set encoding utf-8
spawn deno run -A --no-check --config ${REPOSITORY}deno.jsonc ${REPOSITORY}systems/ghost/run.js chrome
expect {
  -re {VIVALENCE/GHOST} { puts "\\nISLAND" }
  timeout { puts "\\nTIMEOUT island"; exit 2 }
  eof { puts "\\nEOF before the island"; exit 3 }
}
expect {
  -re {● ghost} { puts "\\nREGIONS" }
  timeout { puts "\\nTIMEOUT regions"; exit 2 }
  eof { puts "\\nEOF before the regions"; exit 3 }
}
send "${QUIT}"
expect {
  eof { puts "\\nEXITED" }
  timeout { puts "\\nHUNG after /quit"; exit 4 }
}
lassign [wait] pid spawnid os status
exit $status
`;

export const proof = async () => {
  const world = await boot({ recipe: DEMO, prefix: "viva-chrome-" });
  const home = await Deno.makeTempDir({ prefix: "viva-chrome-home-" });
  try {
    const carried = Object.fromEntries(CARRIED.filter((key) => Deno.env.has(key)).map((key) => [key, Deno.env.get(key)]));
    const { code, stdout, stderr } = await new Deno.Command("expect", {
      args: ["-c", SCRIPT],
      cwd: `${world.root}/instance`,
      env: { ...carried, ...world.env, HOME: home, TERM: "xterm-256color", COLUMNS: "120", LINES: "36" },
      clearEnv: true,
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    }).output();
    const transcript = new TextDecoder().decode(stdout);
    const marks = ["ISLAND", "REGIONS", "EXITED"].filter((mark) => transcript.includes(`\n${mark}`));
    const plain = transcript.replace(/\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07|\x1b[=>]/g, "").replace(/\s+\n/g, "\n");
    return { code, marks, island: transcript.includes("VIVALENCE/GHOST"), regions: transcript.includes("● ghost"), stderr: new TextDecoder().decode(stderr).trim(), tail: plain.slice(-1500) };
  } finally {
    await world.stop();
  }
};

if (import.meta.main) {
  const held = await proof();
  console.log(JSON.stringify(held));
  Deno.exit(held.code === 0 && held.marks.length === 3 ? 0 : 1);
}
