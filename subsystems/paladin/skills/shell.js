import { v, Vector } from "@vivalence/typology";

const TAIL = 8_000;

export const shell = new Vector().open(
  {
    nature: "/shell/run",
    valence: "One-shot shell command, cwd = this mode's root. The output tail and the exit code " +
      'come back; a nonzero code is information, not failure. Example: { command: "ls ' +
      'dataset | head" }.',
    input: v.object({
      command: v.string(),
      timeout: v.integer({ minimum: 1000, maximum: 120000 }).default(30000),
    }),
  },
  async (ctx) => {
    const spawned = new Deno.Command("zsh", {
      args: ["-c", ctx.input.command],
      cwd: ctx.root,
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
