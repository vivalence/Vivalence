const RECORDERS = [
  [
    (os) => os === "darwin",
    {
      command: "ffmpeg",
      args: [
        "-loglevel", "error",
        "-f", "avfoundation",
        "-i", ":default",
        "-ar", "16000",
        "-ac", "1",
        "-f", "f32le",
        "-",
      ],
      rate: 16000,
    },
  ],
];

export const native = (os) => {
  const known = RECORDERS.find(([runs]) => runs(os));
  if (known === undefined) throw new Error(`no recorder known for ${os}: set microphone.recorder`);
  return known[1];
};

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
