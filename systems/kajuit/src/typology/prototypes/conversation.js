import { atom } from "nanostores";
import { soma } from "@vivalence/typology";

export function conversation({ terminal, box }) {
  const $streaming = atom(null);
  const $pending = atom(false);
  const $error = atom(null);

  let down = null;
  let up = null;

  async function drain(stream) {
    let assistant = null;
    try {
      for await (const packet of stream) {
        if ((packet.channel ?? "dialogue") === "speech") {
          box.device.speaker.out.enqueue(box.drivers.audio.decode(packet.audio));
          continue;
        }
        assistant = soma.pour(assistant, packet);
        $pending.set(false);
        $streaming.set(packet.event === "/turn/close" ? null : assistant);
        if (packet.event === "/turn/close") assistant = null;
      }
    } catch (error) {
      if (error.name !== "AbortError") $error.set(error.message);
    } finally {
      $pending.set(false);
    }
  }

  function send(parts, { tune } = {}) {
    const thread = terminal.thread;
    down?.abort();
    down = new AbortController();
    $pending.set(true);
    $error.set(null);
    drain(
      thread.mode.harness.dialogue.stream(
        { thread: thread.id, parts, tune },
        { signal: down.signal },
      ),
    );
  }

  const abort = () => down?.abort();

  async function listen() {
    const thread = terminal.thread;
    await box.device.microphone.claim();
    await box.device.speaker.claim();
    up = new AbortController();
    drain(
      await thread.mode.connection.publish(
        "/harness/verbatim/stream",
        box.device.microphone.in.stream(up.signal),
        { signal: up.signal },
      ),
    );
  }

  const mute = () => {
    up?.abort();
    up = null;
    box.device.microphone.release();
    box.device.speaker.flush();
  };

  function close() {
    abort();
    mute();
    $streaming.set(null);
    $pending.set(false);
  }

  const unswitch = terminal.$thread.subscribe(() => abort());

  return {
    $streaming,
    $pending,
    $error,
    send,
    abort,
    listen,
    mute,
    close,
    teardown: () => {
      close();
      unswitch();
    },
  };
}
