export async function* samples(recorder, signal) {
  const spawned = new Deno.Command(recorder.command, {
    args: recorder.args,
    stdout: "piped",
    stderr: "null",
    signal,
  }).spawn();
  let carried = new Uint8Array(0);
  for await (const chunk of spawned.stdout) {
    const joined = new Uint8Array(carried.byteLength + chunk.byteLength);
    joined.set(carried);
    joined.set(chunk, carried.byteLength);
    const whole = joined.byteLength - (joined.byteLength % 4);
    carried = joined.slice(whole);
    yield new Float32Array(joined.buffer.slice(0, whole));
  }
}
