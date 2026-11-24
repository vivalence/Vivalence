import { specimen } from "@vivalence/typology";
import { Microphone } from "./microphone.s14.js";
import { native } from "./recorder.s14.js";

const box = { drivers: { audio: { context: null } } };
const settled = () => new Promise((resolve) => setTimeout(resolve, 700));
const sine = (rate) => ({
  command: "ffmpeg",
  args: ["-loglevel", "error", "-re", "-f", "lavfi", "-i", "sine=frequency=441:duration=30", "-ar", String(rate), "-ac", "1", "-f", "f32le", "-"],
  rate,
});

specimen.describe("the tty's microphone — a recorder is data", { sanitizeOps: false, sanitizeResources: false }, () => {
  specimen.it("a packet carries the recorder's rate", async () => {
    const microphone = new Microphone(box);
    microphone.recorder = sine(8000);
    await microphone.claim();
    const { value } = await microphone.frames().next();
    microphone.release("stop");
    specimen.expect(value.rate).toBe(8000);
  });

  specimen.it("an absent command rejects the claim", async () => {
    const microphone = new Microphone(box);
    microphone.recorder = { command: "recorder-absent", args: [], rate: 16000 };
    await specimen.expect(microphone.claim()).rejects.toThrow("Failed to spawn 'recorder-absent'");
    specimen.expect(microphone.claimed).toBe(false);
  });

  specimen.it("a recorder that dies releases the microphone and says why", async () => {
    const microphone = new Microphone(box);
    microphone.recorder = { command: "ffmpeg", args: ["-loglevel", "error", "-f", "lavfi", "-i", "nope=1", "-f", "f32le", "-"], rate: 16000 };
    await microphone.claim();
    await settled();
    specimen.expect(microphone.claimed).toBe(false);
    specimen.expect(microphone.error).toMatch(/^ffmpeg exited \d+: /);
  });

  specimen.it("an operating system without a recorder is named", () => {
    specimen.expect(() => native("windows")).toThrow("no recorder known for windows: set microphone.recorder");
  });
});
