import { specimen, Span, Pipe, Queue, trace } from "@vivalence/typology";

specimen.describe("trace: chronicle — the fold", () => {
  specimen.it("a request traced end to end: marks fold into the tree the waterfall reads", () => {
    const render = new Span("render").open();
    const provider = render.branch("provider").open();
    provider.note({ model: "opus" });
    provider.branch("translate").open().close();
    provider.close();
    render.close();

    const root = trace.chronicle(render.records).roots[0];
    specimen.expect(root.path).toBe("/render");
    specimen.expect(root.children[0].nature).toBe("provider");
    specimen.expect(root.children[0].children[0].nature).toBe("translate");
    specimen.expect(root.children[0].entries[0].data).toEqual({ model: "opus" });
    specimen.expect(trace.duration(root) >= trace.duration(root.children[0])).toBe(true);
  });

  specimen.it("a log-style session: notes and a fault, never a clock", () => {
    const log = new Span("oracle");
    log.branch("props").note({ terminal: "t1", buffer: "b1" });
    const call = log.branch("cortex/object");
    call.note({ prompt: "who am i" });
    call.fault(new Error("the oracle falters"));

    const story = trace.chronicle(log.records);
    specimen.expect(story.roots.map((node) => node.path)).toEqual(["/oracle/props", "/oracle/cortex/object"]);
    specimen.expect(story.roots[1].timing).toBe(null);
    specimen.expect(story.roots[1].fault.message).toBe("the oracle falters");
    specimen.expect(trace.faulty(story)).toBe(true);
  });

  specimen.it("the same nature twice stays two calls — id, not path, is identity", () => {
    const render = new Span("render").open();
    render.branch("provider").open().note({ attempt: 1 }).close();
    render.branch("provider").open().note({ attempt: 2 }).close();
    render.close();

    const root = trace.chronicle(render.records).roots[0];
    specimen.expect(root.children.length).toBe(2);
    specimen.expect(root.children.map((child) => child.entries[0].data.attempt)).toEqual([1, 2]);
  });

  specimen.it("two requests interleave through one pipe and unbraid in the fold", () => {
    const records = [];
    const pipe = new Pipe();
    pipe.tap((record) => records.push(record));
    const first = new Span("request").to(pipe).open();
    const second = new Span("request").to(pipe).open();
    first.branch("db").open().close();
    second.branch("db").open().close();
    second.close();
    first.close();

    const story = trace.chronicle(records);
    specimen.expect(story.roots.length).toBe(2);
    specimen.expect(story.roots.map((root) => root.children.length)).toEqual([1, 1]);
  });

  specimen.it("marks define the tree: an unmarked ancestor never appears, the path remembers it", () => {
    const log = new Span("oracle");
    log.branch("cortex/object").note({ prompt: "hi" });

    const story = trace.chronicle(log.records);
    specimen.expect(story.roots.length).toBe(1);
    specimen.expect(story.roots[0].nature).toBe("object");
    specimen.expect(story.roots[0].path).toBe("/oracle/cortex/object");
  });

  specimen.it("live: the backlog seeds the atom, then the fold continues as marks land", () => {
    const session = new Span("session");
    session.open();
    const $live = trace.live(session);
    specimen.expect($live.get().roots[0].path).toBe("/session");
    session.branch("boot").open().close();
    specimen.expect($live.get().roots[0].children[0].nature).toBe("boot");
    specimen.expect(trace.duration($live.get().roots[0].children[0])).not.toBe(null);
  });
});

specimen.describe("trace: reading the pipe whenever", () => {
  specimen.it("a queue after the fact: retained, ordered, drained at the reader's pace", async () => {
    const queue = new Queue();
    const span = new Span("request").to(queue);
    span.open();
    span.branch("db").open().close();
    span.close();

    specimen.expect(queue.depth).toBe(4);
    queue.close();
    const landed = [];
    for await (const record of queue.drain()) landed.push(record);
    specimen.expect(landed.map((record) => record.verb)).toEqual(["open", "open", "close", "close"]);
    specimen.expect(trace.chronicle(landed).roots[0].children[0].nature).toBe("db");
  });

  specimen.it("the journal replays into the same story the live pipe told", () => {
    const heard = [];
    const span = new Span("request").to((record) => heard.push(record));
    span.open();
    span.branch("provider").open().note({ model: "opus" }).close();
    span.close();

    specimen.expect(span.records).toEqual(heard);
    specimen.expect(trace.chronicle(span.records).roots).toEqual(trace.chronicle(heard).roots);
  });
});

specimen.describe("trace: drain policies — when and whether, not where", () => {
  specimen.it("hold: nothing lands mid-flight, the whole story lands when the root seals", () => {
    const landed = [];
    const span = new Span("request").to(trace.hold((record) => landed.push(record)));
    span.open();
    span.branch("provider").open().close();
    specimen.expect(landed.length).toBe(0);
    span.close();
    specimen.expect(landed.map((record) => record.verb)).toEqual(["open", "open", "close", "close"]);
  });

  specimen.it("flush: a session that never closes still drains on demand", () => {
    const landed = [];
    const drain = trace.hold((record) => landed.push(record));
    const log = new Span("oracle").to(drain);
    log.branch("props").note({ buffer: "b1" });
    specimen.expect(landed.length).toBe(0);
    drain.flush();
    specimen.expect(landed.length).toBe(1);
  });

  specimen.it("decant(faulty): the broken request lands whole, the healthy one evaporates", () => {
    const landed = [];
    const pipe = new Pipe();
    pipe.tap(trace.decant((record) => landed.push(record), trace.faulty));

    const healthy = new Span("request").to(pipe).open();
    healthy.branch("db").open().close();
    healthy.close();
    specimen.expect(landed.length).toBe(0);

    const broken = new Span("request").to(pipe).open();
    broken.branch("db").open().fault(new Error("locked")).close();
    broken.close();
    specimen.expect(landed.length).toBe(5);
    specimen.expect(landed[0].verb).toBe("open");
    specimen.expect(landed.some((record) => record.verb === "fault")).toBe(true);
  });

  specimen.it("decant(slower): records are just data — hand-authored, no Span in sight", () => {
    const request = (span, begun, sealedAt) => [
      { span, trace: null, path: "/request", verb: "open", at: begun },
      { span, trace: null, path: "/request", verb: "close", at: sealedAt },
    ];
    const landed = [];
    const sample = trace.decant((record) => landed.push(record), trace.slower(500));
    for (const record of [...request("quick", 0, 80), ...request("laggard", 100, 900)]) sample(record);
    specimen.expect(landed.map((record) => record.span)).toEqual(["laggard", "laggard"]);
  });
});

specimen.describe("trace: dictate — chronicle's mirror", () => {
  specimen.it("a chronicle dictated and re-chronicled is the same story", () => {
    const render = new Span("render").open();
    render.branch("provider").open().note({ model: "opus" }).close();
    render.fault(new Error("late"));
    render.close();

    const story = trace.chronicle(render.records);
    specimen.expect(trace.chronicle(trace.dictate(story)).roots).toEqual(story.roots);
  });

  specimen.it("dictate reads, never mutates its chronicle", () => {
    const story = trace.chronicle([
      { span: 1, trace: null, path: "/request", verb: "open", at: 0 },
      { span: 1, trace: null, path: "/request", verb: "close", at: 9 },
    ]);
    const before = JSON.stringify(story.roots);
    trace.dictate(story);
    specimen.expect(JSON.stringify(story.roots)).toBe(before);
  });
});
