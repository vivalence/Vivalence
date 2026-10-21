import { specimen, Span, Pipe, Queue, trace } from "@vivalence/typology";

specimen.describe("trace: chronicle — the fold", () => {
  specimen.it("a request traced end to end: marks fold into the tree the waterfall reads", () => {
    const render = new Span("render").start();
    const provider = render.branch("provider").start();
    provider.log({ model: "opus" });
    provider.branch("translate").start().stop();
    provider.stop();
    render.stop();

    const root = trace.chronicle(render.history).roots[0];
    specimen.expect(root.path).toEqual(["render"]);
    specimen.expect(root.children[0].nature).toBe("provider");
    specimen.expect(root.children[0].children[0].nature).toBe("translate");
    specimen.expect(root.children[0].entries[0].data).toEqual({ model: "opus" });
    specimen.expect(trace.duration(root) >= trace.duration(root.children[0])).toBe(true);
  });

  specimen.it("a log-style session: notes and a fault, never a clock", () => {
    const log = new Span("oracle");
    log.branch("props").log({ terminal: "t1", buffer: "b1" });
    const call = log.branch("cortex").branch("object");
    call.log({ prompt: "who am i" });
    call.fault(new Error("the oracle falters"));

    const story = trace.chronicle(log.history);
    specimen.expect(story.roots.map((node) => node.path)).toEqual([["oracle", "props"], ["oracle", "cortex", "object"]]);
    specimen.expect(story.roots[1].timing).toBe(null);
    specimen.expect(story.roots[1].fault.message).toBe("the oracle falters");
  });

  specimen.it("the same nature twice stays two calls — the instance rides the nature, the path is identity", () => {
    const render = new Span("render").start();
    render.branch("provider/1").start().log({ attempt: 1 }).stop();
    render.branch("provider/2").start().log({ attempt: 2 }).stop();
    render.stop();

    const root = trace.chronicle(render.history).roots[0];
    specimen.expect(root.children.length).toBe(2);
    specimen.expect(root.children.map((child) => child.entries[0].data.attempt)).toEqual([1, 2]);
    specimen.expect(root.children.map((child) => child.nature)).toEqual(["provider/1", "provider/2"]);

    const merged = new Span("render");
    merged.branch("provider").log({ attempt: 1 });
    merged.branch("provider").log({ attempt: 2 });
    specimen.expect(trace.chronicle(merged.history).roots.length).toBe(1);
    specimen.expect(trace.chronicle(merged.history).roots[0].entries.length).toBe(2);
  });

  specimen.it("two requests interleave through one pipe and unbraid in the fold", () => {
    const records = [];
    const pipe = new Pipe();
    pipe.tap((record) => records.push(record));
    const first = new Span("request/1");
    first.pipe.tap(pipe);
    first.start();
    const second = new Span("request/2");
    second.pipe.tap(pipe);
    second.start();
    first.branch("db").start().stop();
    second.branch("db").start().stop();
    second.stop();
    first.stop();

    const story = trace.chronicle(records);
    specimen.expect(story.roots.length).toBe(2);
    specimen.expect(story.roots.map((root) => root.children.length)).toEqual([1, 1]);
  });

  specimen.it("marks define the tree: an unmarked ancestor never appears, the path remembers it", () => {
    const log = new Span("oracle");
    log.branch("cortex").branch("object").log({ prompt: "hi" });

    const story = trace.chronicle(log.history);
    specimen.expect(story.roots.length).toBe(1);
    specimen.expect(story.roots[0].nature).toBe("object");
    specimen.expect(story.roots[0].path).toEqual(["oracle", "cortex", "object"]);
  });

  specimen.it("live: the backlog seeds the atom, then the fold continues as marks land", () => {
    const session = new Span("session");
    session.start();
    const $live = trace.live(session);
    specimen.expect($live.get().roots[0].path).toEqual(["session"]);
    session.branch("boot").start().stop();
    specimen.expect($live.get().roots[0].children[0].nature).toBe("boot");
    specimen.expect(trace.duration($live.get().roots[0].children[0])).not.toBe(null);
  });
});

specimen.describe("trace: reading the pipe whenever", () => {
  specimen.it("a queue after the fact: retained, ordered, drained at the reader's pace", async () => {
    const queue = new Queue();
    const span = new Span("request");
    span.pipe.tap(queue);
    span.start();
    span.branch("db").start().stop();
    span.stop();

    specimen.expect(queue.depth).toBe(4);
    queue.close();
    const landed = [];
    for await (const record of queue.drain()) landed.push(record);
    specimen.expect(landed.map((record) => record.track)).toEqual(["start", "start", "stop", "stop"]);
    specimen.expect(trace.chronicle(landed).roots[0].children[0].nature).toBe("db");
  });

  specimen.it("the journal replays into the same story the live pipe told", () => {
    const heard = [];
    const span = new Span("request");
    span.pipe.tap((record) => heard.push(record));
    span.start();
    span.branch("provider").start().log({ model: "opus" }).stop();
    span.stop();

    specimen.expect(span.history).toEqual(heard);
    specimen.expect(trace.chronicle(span.history).roots).toEqual(trace.chronicle(heard).roots);
  });
});

specimen.describe("trace: dictate — chronicle's mirror", () => {
  specimen.it("a chronicle dictated and re-chronicled is the same story", () => {
    const render = new Span("render").start();
    render.branch("provider").start().log({ model: "opus" }).stop();
    render.fault(new Error("late"));
    render.stop();

    const story = trace.chronicle(render.history);
    specimen.expect(trace.chronicle(trace.dictate(story)).roots).toEqual(story.roots);
  });

  specimen.it("dictate reads, never mutates its chronicle", () => {
    const story = trace.chronicle([
      { at: 0, path: ["request"], track: "start" },
      { at: 9, path: ["request"], track: "stop" },
    ]);
    const before = JSON.stringify(story.roots);
    trace.dictate(story);
    specimen.expect(JSON.stringify(story.roots)).toBe(before);
  });
});
