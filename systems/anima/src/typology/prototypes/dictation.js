import { atom } from "nanostores";
import { pcm, verbatim } from "@vivalence/typology";

export function dictation({ terminals, box }) {
  const $active = atom("idle");
  const $committed = atom("");
  const $tail = atom("");
  const $error = atom(null);

  let feed = null;
  let link = null;
  let settled = null;
  let session = 0;

  async function* frames(signal) {
    const rate = box.drivers.audio.context.sampleRate;
    let pts = 0;
    for await (const samples of box.device.microphone.in.stream(signal)) {
      yield { event: "/audio/packet", audio: pcm.encode(samples), rate, pts };
      pts += samples.length / rate;
    }
  }

  async function reduce(events, id) {
    let state = verbatim.empty;
    try {
      for await (const event of events) {
        if (id !== session) break;
        state = verbatim.fold(state, event);
        $committed.set(verbatim.transcript(state));
        $tail.set(state.tail);
      }
    } catch (error) {
      if (id === session && error.name !== "AbortError") $error.set(error.message);
    } finally {
      if (id === session) {
        box.device.microphone.release();
        feed = null;
        link = null;
        $tail.set("");
        $active.set("idle");
      }
    }
  }

  async function start() {
    if ($active.get() !== "idle") return;
    const thread = terminals.active?.thread;
    if (!thread?.mode?.harness?.verbatim?.stream) {
      $error.set("no verbatim harness on this thread");
      return;
    }
    const id = ++session;
    $error.set(null);
    $committed.set("");
    $tail.set("");
    $active.set("arming");
    try {
      await box.device.microphone.claim();
    } catch (error) {
      if (id === session) {
        $error.set(error.message);
        $active.set("idle");
      }
      return;
    }
    if (id !== session) {
      if ($active.get() === "idle") box.device.microphone.release();
      return;
    }
    feed = new AbortController();
    link = new AbortController();
    const events = thread.mode.harness.verbatim.stream(frames(feed.signal), {
      input: { thread: thread.id },
      signal: link.signal,
    });
    $active.set("listening");
    settled = reduce(events, id);
  }

  function stop() {
    if ($active.get() !== "listening") return;
    $active.set("settling");
    feed?.abort();
    box.device.microphone.pause();
  }

  function cancel() {
    const was = $active.get();
    session += 1;
    feed?.abort();
    link?.abort();
    if (was !== "idle") box.device.microphone.release();
    $committed.set("");
    $tail.set("");
    $active.set("idle");
  }

  return {
    $active,
    $committed,
    $tail,
    $error,
    start,
    stop,
    cancel,
    settled: () => settled,
  };
}
