import { specimen, Queue } from "@vivalence/typology";

specimen.describe("Queue", () => {
  specimen.it("a queue drains FIFO and close ends the wait", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c").close();
    const collected = [];
    for await (const value of queue) collected.push(value);
    specimen.expect(collected).toEqual(["a", "b", "c"]);

    const empty = new Queue();
    let done = false;
    const task = (async () => {
      for await (const value of empty) {}
      done = true;
    })();
    await Promise.resolve();
    specimen.expect(done).toBe(false);
    specimen.expect(empty.depth).toBe(0);
    empty.close();
    await task;
    specimen.expect(done).toBe(true);
  });

  specimen.it("a flush drops the pending tail and an abort hard-cuts the loop", async () => {
    const queue = new Queue();
    queue.enqueue("a").enqueue("b").enqueue("c");
    const collected = [];
    for await (const value of queue) {
      collected.push(value);
      if (value === "a") {
        queue.flush();
        queue.close();
      }
    }
    specimen.expect(collected).toEqual(["a"]);

    const output = new Queue();
    const controller = new AbortController();
    const played = [];
    const loop = (async () => {
      for await (const frame of output.drain(controller.signal)) played.push(frame);
    })();
    output.enqueue("f1");
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    specimen.expect(played).toEqual(["f1"]);
    controller.abort();
    await loop;
    output.enqueue("f2");
    specimen.expect(played).toEqual(["f1"]);
  });

  specimen.it("a speaker plays through a mid-sentence barge-in", async () => {
    const speaker = new Queue();
    const played = [];
    let stops = 0;
    const player = (async () => {
      for await (const chunk of speaker) played.push(chunk);
    })();

    const bargeIn = () => {
      stops++;
      speaker.flush();
    };

    speaker.enqueue("hello");
    while (speaker.depth > 0) await Promise.resolve();

    for (const chunk of ["today", "is", "a", "good", "day"]) speaker.enqueue(chunk);
    bargeIn();
    for (const chunk of ["wait", "go", "ahead"]) speaker.enqueue(chunk);
    speaker.close();

    await player;
    specimen.expect(stops).toBe(1);
    specimen.expect(played).toEqual(["hello", "wait", "go", "ahead"]);
  });
});
