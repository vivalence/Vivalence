import { v, Vector } from "@vivalence/typology";
import { absolute } from "./fs.js";

const TAIL = 8_000;

const runnable = (candidate) => {
  const paths = candidate.includes("/")
    ? [candidate]
    : (Deno.env.get("PATH") ?? "").split(":").map((dir) => `${dir}/${candidate}`);
  return paths.some((path) => {
    try {
      return Deno.statSync(path).isFile;
    } catch {
      return false;
    }
  });
};

const interpreter = ["zsh", Deno.env.get("SHELL"), "bash", "sh"].filter(Boolean).find(runnable) ?? "sh";

export const shell = new Vector().open(
  {
    nature: "/shell/run",
    valence: "One-shot shell command in an absolute working directory. The output tail and the exit " +
      "code come back; a nonzero code is information, not failure. " +
      'Example: { command: "ls | head", cwd: "/home/operator/jdex" }.',
    input: v.object({
      command: v.string().desc('The command, run through the shell. Example: "ls | head"'),
      cwd: v.string().desc('Absolute working directory. Example: "/home/operator/jdex"'),
      timeout: v.integer({ minimum: 1000, maximum: 120000 }).default(30000),
    }),
  },
  async (ctx) => {
    const spawned = new Deno.Command(interpreter, {
      args: ["-c", ctx.input.command],
      cwd: absolute(ctx.input.cwd),
      stdout: "piped",
      stderr: "piped",
      signal: AbortSignal.timeout(ctx.input.timeout),
    });
    try {
      const { code, stdout, stderr } = await spawned.output();
      const decoder = new TextDecoder();
      const merged = [decoder.decode(stdout), decoder.decode(stderr)]
        .map((stream) => stream.trim())
        .filter(Boolean)
        .join("\n");
      const tail = merged.length > TAIL
        ? `… tail of ${merged.length} bytes\n${merged.slice(-TAIL)}`
        : merged;
      return { output: { message: tail || "(no output)", code } };
    } catch (fault) {
      return {
        condition: "ERROR",
        output: { message: `${fault.message} — command killed (timeout ${ctx.input.timeout}ms?)` },
      };
    }
  },
);
