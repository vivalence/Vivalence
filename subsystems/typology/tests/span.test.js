import { specimen, Span, Pipe } from "@vivalence/typology";
// @beef IMPORTANT TODO: test shards.track and belt.trace

specimen.describe("Span: the cursor", () => {
  specimen.it("born wired — no pipe ceremony, the first mark already flows", () => {
    const heard = [];
    const span = new Span("boot");
    span.pipe.tap((record) => heard.push(record));
    span.log({ ready: true });
    specimen.expect(heard[0].path).toEqual(["boot"]);
    specimen.expect(heard[0].data).toEqual({ ready: true });
  });

  specimen.it("the span keeps its own journal — readable after the fact, no drain wired", () => {
    const span = new Span("request");
    span.start();
    span.branch("db").log({ rows: 3 });
    span.stop();
    specimen.expect(span.history.length).toBe(3);
    specimen.expect(span.history.map((record) => record.track)).toEqual(["start", "log", "stop"]);
  });

  specimen.it("one tap on the root hears the whole tree", () => {
    const heard = [];
    const root = new Span("daemon");
    root.pipe.tap((record) => heard.push(record));
    root.branch("render").branch("provider").log({ model: "opus" });
    specimen.expect(heard[0].path).toEqual(["daemon", "render", "provider"]);
  });

  specimen.it("a tap pours one span into another pipe — mode logs join shell telemetry", () => {
    const telemetry = new Pipe();
    const heard = [];
    telemetry.tap((record) => heard.push(record));
    const span = new Span("oracle");
    span.pipe.tap(telemetry);
    span.log({ hello: true });
    specimen.expect(heard[0].path).toEqual(["oracle"]);
  });

  specimen.it("every track is a method; fault flattens the Error", () => {
    const heard = [];
    const span = new Span("pull");
    span.pipe.tap((record) => heard.push(record));
    span.start().log({ n: 1 }).fault(new Error("empty")).stop();
    specimen.expect(heard.map((record) => record.track)).toEqual(["start", "log", "fault", "stop"]);
    specimen.expect(heard[2].data.type).toBe("Error");
    specimen.expect(heard[2].data.message).toBe("empty");
    specimen.expect(heard[2].data.code).toBeUndefined();
    specimen.expect(() => span.track("unknown", {})).toThrow();
  });

  specimen.it("a record is a self-describing fact: path, track, clock", () => {
    const root = new Span("render");
    const child = root.branch("provider");
    const before = performance.timeOrigin + performance.now();
    child.log({ attempt: 1 });
    specimen.expect(Object.keys(root.history[0]).sort()).toEqual(["at", "data", "path", "track"]);
    specimen.expect(root.history[0].path).toEqual(child.absolute);
    specimen.expect(root.history[0].path.slice(0, -1)).toEqual(root.absolute);
    specimen.expect(child.history).toEqual(root.history);
    specimen.expect(root.history[0].at).toBeGreaterThanOrEqual(before);
  });
});
