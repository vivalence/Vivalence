import { specimen, Queue } from "@vivalence/typology";

specimen.describe("Queue", () => {
  specimen.it("drains enqueued values in FIFO order", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c");
    queue.close();
    const collected = [];
    for await (const value of queue) collected.push(value);
    specimen.expect(collected).toEqual(["a", "b", "c"]);
  });

  specimen.it("depth reflects pending items", () => {
    const queue = new Queue();
    specimen.expect(queue.depth).toBe(0);
    queue.enqueue("x").enqueue("y");
    specimen.expect(queue.depth).toBe(2);
  });

  specimen.it("flush clears pending items", () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b");
    queue.flush();
    specimen.expect(queue.depth).toBe(0);
  });

  specimen.it("flush does not recall already-yielded items", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c");
    const collected = [];
    for await (const value of queue) {
      collected.push(value);
      if (value === "a") { queue.flush(); queue.close(); }
    }
    specimen.expect(collected).toEqual(["a"]);
  });

  specimen.it("drain suspends when empty and wakes on enqueue", async () => {
    const queue = new Queue();
    const collected = [];
    const drainTask = (async () => {
      for await (const value of queue) collected.push(value);
    })();
    await Promise.resolve(); await Promise.resolve();
    specimen.expect(collected).toEqual([]);
    queue.enqueue("first");
    await Promise.resolve(); await Promise.resolve();
    specimen.expect(collected).toEqual(["first"]);
    queue.enqueue("second");
    queue.close();
    await drainTask;
    specimen.expect(collected).toEqual(["first", "second"]);
  });

  specimen.it("close terminates drain after buffer empties", async () => {
    const queue = new Queue();
    let completed = false;
    const drainTask = (async () => {
      for await (const _ of queue) {}
      completed = true;
    })();
    await Promise.resolve();
    specimen.expect(completed).toBe(false);
    queue.close();
    await drainTask;
    specimen.expect(completed).toBe(true);
  });

  specimen.it("barge-in: flush pending, enqueue replacement", () => {
    const queue = new Queue();
    queue.enqueue({ chunk: "hello " }).enqueue({ chunk: "world" });
    specimen.expect(queue.depth).toBe(2);
    queue.flush();
    queue.enqueue({ chunk: "actually, nevermind" });
    specimen.expect(queue.depth).toBe(1);
  });
});

specimen.describe("Queue: speaker scenario", () => {
  specimen.it("session orchestrates TTS pipeline with barge-in and replacement", async () => {
    const speaker = new Queue();
    const played = [];
    let stopCount = 0;

    const player = (async () => {
      for await (const chunk of speaker) played.push(chunk);
    })();

    const session = {
      stopCurrentSource: () => { stopCount++; },
      bargeIn() {
        this.stopCurrentSource();
        speaker.flush();
      },
    };

    speaker.enqueue("hello");
    while (speaker.depth > 0) await Promise.resolve();

    for (const chunk of ["today", "is", "a", "good", "day"]) speaker.enqueue(chunk);

    session.bargeIn();

    for (const chunk of ["wait", "go", "ahead"]) speaker.enqueue(chunk);
    speaker.close();

    await player;

    specimen.expect(stopCount).toBe(1);
    specimen.expect(played).toEqual(["hello", "wait", "go", "ahead"]);
  });
});
