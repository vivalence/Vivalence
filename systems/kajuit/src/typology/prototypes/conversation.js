import { atom } from "nanostores";
import { pcm, soma } from "@vivalence/typology";

export function conversation({ terminal, box }) {
  const $streaming = atom(null);
  const $pending = atom(false);
  const $error = atom(null);

  let down = null;

  async function drain(stream) {
    let assistant = null;
    try {
      for await (const packet of stream) {
        if ((packet.channel ?? "dialogue") === "speech") {
          box.device.speaker.out.enqueue(pcm.decode(packet.audio));
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

  function close() {
    abort();
    box.device.speaker.flush();
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
    close,
    teardown: () => {
      close();
      unswitch();
    },
  };
}
