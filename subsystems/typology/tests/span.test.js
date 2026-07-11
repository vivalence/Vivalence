import { specimen, Span, Pipe } from "@vivalence/typology";
// @beef IMPORTANT TODO: test shards.track and belt.trace

specimen.describe("Span: the cursor", () => {
  specimen.it("born wired — no pipe ceremony, the first mark already flows", () => {
    const heard = [];
    const span = new Span("boot");
    span.pipe.tap((record) => heard.push(record));
    span.note({ ready: true });
    specimen.expect(heard[0].path).toBe("/boot");
    specimen.expect(heard[0].data).toEqual({ ready: true });
  });

  specimen.it("the span keeps its own journal — readable after the fact, no drain wired", () => {
    const span = new Span("request");
    span.open();
    span.branch("db").note({ rows: 3 });
    span.close();
    specimen.expect(span.records.length).toBe(3);
    specimen.expect(span.records.map((record) => record.verb)).toEqual(["open", "note", "close"]);
  });

  specimen.it("one tap on the root hears the whole tree", () => {
    const heard = [];
    const root = new Span("daemon").to((record) => heard.push(record));
    root.branch("render").branch("provider").note({ model: "opus" });
    specimen.expect(heard[0].path).toBe("/daemon/render/provider");
  });

  specimen.it("to() pours one span into another pipe — mode logs join shell telemetry", () => {
    const telemetry = new Pipe();
    const heard = [];
    telemetry.tap((record) => heard.push(record));
    new Span("oracle").to(telemetry).note({ hello: true });
    specimen.expect(heard[0].path).toBe("/oracle");
  });

  specimen.it("every verb is a mark; fault flattens the Error", () => {
    const heard = [];
    const span = new Span("pull").to((record) => heard.push(record));
    span.open().note({ n: 1 }).fault(new Error("empty")).close();
    specimen.expect(heard.map((record) => record.verb)).toEqual(["open", "note", "fault", "close"]);
    specimen.expect(heard[2].data).toEqual({ message: "empty", code: null });
  });

  specimen.it("a record is a self-describing fact: identity, lineage, path, clock", () => {
    const root = new Span("render");
    const child = root.branch("provider");
    child.note({ attempt: 1 });
    specimen.expect(root.records[0].span).toBe(child.id);
    specimen.expect(root.records[0].trace).toBe(root.id);
  });
});
