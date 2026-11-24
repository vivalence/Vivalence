// limit: 3000 chars · the TARGET: systems/ghost/subjects/app/prototypes/box/device/microphone/recorder.js (new), Q17 (quests/m123-call-faculty.org)
// S12 = the tty dictates (amen 11-17); S14 = box configuration SKIPPED 11-17 (his plane: a client's devices, out of scope) — its form parked in walk-11-17/*.s14.js
// run 11-17 by walk-11-17/recorder.probe.js tty.fixed on a sine (never his microphone); S12's form: a dead recorder hangs the dictation · an absent command is an unhandled rejection (Deno ends the client) — the fix below, shown 11-17, no amen yet
// beside it, microphone.js (copy: walk-11-17/microphone.tty.fixed.js): RATE = 16000; recorder = ONE literal { command: "ffmpeg", args: ["-loglevel", "error", "-f", "avfoundation", "-i", ":default", "-ar", String(RATE), "-ac", "1", "-f", "f32le", "-"] }
//   record() = try { feed; hear(microphone, samples(microphone.recorder, feed.signal)); microphone.feed = feed; rate = RATE; … } catch { teardown(microphone, err); throw err }
//   hear() = for await chunk → microphone.in.send(chunk), catch → teardown(microphone, err), as acquire's track.onended does
// unprobed: the capture itself (his microphone, his go) · microphone.$error has no reader on any client
export function samples(recorder, signal) {
  const spawned = new Deno.Command(recorder.command, {
    args: recorder.args,
    stdout: "piped",
    stderr: "piped",
    signal,
  }).spawn();
  const said = new Response(spawned.stderr).text();
  return (async function* () {
    let carried = new Uint8Array(0);
    for await (const chunk of spawned.stdout) {
      const joined = new Uint8Array(carried.byteLength + chunk.byteLength);
      joined.set(carried);
      joined.set(chunk, carried.byteLength);
      const whole = joined.byteLength - (joined.byteLength % 4);
      carried = joined.slice(whole);
      yield new Float32Array(joined.buffer.slice(0, whole));
    }
    const status = await spawned.status;
    if (signal.aborted || status.success) return;
    throw new Error(`${recorder.command} exited ${status.code}: ${(await said).trim().split("\n").at(-1)}`);
  })();
}
