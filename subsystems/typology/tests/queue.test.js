import { specimen, Queue } from "@vivalence/typology";

// Queue = a single-consumer async sink: enqueue() feeds, drain() pulls FIFO and
// suspends when empty. Real sinks:
//   decks/box/device/speaker — out.enqueue(frame); drain(signal) loop; flush() on
//                              barge-in; controller.abort() on teardown
//   traits/.../conversational — ASR audio (enqueue → drain → close), dialogue packets
// Two stop signals: close() is graceful (drain the buffer, then end); an
// AbortSignal is a hard cut. flush() drops pending items only — the barge-in verb.

// ── 1. BASICS — feed, drain FIFO, close ──────────────────────────────────────
specimen.describe("Queue: basics", () => {
  specimen.it("drains enqueued values FIFO until close", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c").close();
    const collected = [];
    for await (const value of queue) collected.push(value);
    specimen.expect(collected).toEqual(["a", "b", "c"]);
  });

  specimen.it("close ends a drain waiting on an empty buffer", async () => {
    const queue = new Queue();
    let done = false;
    const task = (async () => { for await (const _ of queue) {} done = true; })();
    await Promise.resolve();
    specimen.expect(done).toBe(false);
    specimen.expect(queue.depth).toBe(0);
    queue.close();
    await task;
    specimen.expect(done).toBe(true);
  });
});

// ── 2. BARGE-IN — flush pending, abort the loop (the sink verbs) ──────────────
specimen.describe("Queue: barge-in", () => {
  specimen.it("flush drops pending items but not the already-yielded one", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c");
    const collected = [];
    for await (const value of queue) {
      collected.push(value);
      if (value === "a") { queue.flush(); queue.close(); }
    }
    specimen.expect(collected).toEqual(["a"]);
  });

  specimen.it("abort signal hard-cuts the drain loop (speaker teardown)", async () => {
    const out = new Queue();
    const controller = new AbortController();
    const played = [];
    const loop = (async () => {
      for await (const frame of out.drain(controller.signal)) played.push(frame);
    })();
    out.enqueue("f1");
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    specimen.expect(played).toEqual(["f1"]);
    controller.abort();
    await loop;
    out.enqueue("f2"); // loop already ended — later frames are ignored
    specimen.expect(played).toEqual(["f1"]);
  });
});

// ── 3. EDGE CASE — TTS playback with mid-sentence barge-in ───────────────────
specimen.describe("Queue: speaker scenario", () => {
  // A player drains the speaker sink while frames stream in. The user interrupts
  // mid-sentence: stop the current source + flush the queued tail, then resume
  // with a replacement. The already-spoken frame survives; the dropped tail does not.
  specimen.it("plays, barges in (stop + flush), resumes with replacement", async () => {
    const speaker = new Queue();
    const played = [];
    let stops = 0;
    const player = (async () => { for await (const chunk of speaker) played.push(chunk); })();

    const bargeIn = () => { stops++; speaker.flush(); };

    speaker.enqueue("hello");
    while (speaker.depth > 0) await Promise.resolve(); // let "hello" play out

    for (const chunk of ["today", "is", "a", "good", "day"]) speaker.enqueue(chunk);
    bargeIn();                                          // interrupt: drop the sentence
    for (const chunk of ["wait", "go", "ahead"]) speaker.enqueue(chunk);
    speaker.close();

    await player;
    specimen.expect(stops).toBe(1);
    specimen.expect(played).toEqual(["hello", "wait", "go", "ahead"]);
  });
});
