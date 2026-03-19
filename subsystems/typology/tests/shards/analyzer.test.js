import { specimen, shard } from "@vivalence/typology";
import { Vector } from "@vivalence/typology";
import { Aperture } from "@vivalence/typology/aperture";
import { http } from "@vivalence/typology/compiler";

const { analyzer } = shard;
const { Trace, trace, mark } = analyzer;

specimen.describe("analyzer", () => {
  specimen.describe("Trace", () => {
    specimen.it("begin/end records a span", () => {
      const t = new Trace();
      t.begin("op");
      t.end("op");
      specimen.expect(t.spans.length).toBe(1);
      specimen.expect(t.spans[0].name).toBe("op");
      specimen.expect(typeof t.spans[0].start).toBe("number");
      specimen.expect(typeof t.spans[0].end).toBe("number");
    });

    specimen.it("end matches the last unfinished span with that name", () => {
      const t = new Trace();
      t.begin("a");
      t.begin("a");
      t.end("a");
      specimen.expect(t.spans[0].end).toBe(undefined);
      specimen.expect(typeof t.spans[1].end).toBe("number");
    });

    specimen.it("end on unknown name is a no-op", () => {
      const t = new Trace();
      t.end("ghost");
      specimen.expect(t.spans.length).toBe(0);
    });

    specimen.it("timing formats completed spans", () => {
      const t = new Trace();
      t.spans.push({ name: "a", start: 100, end: 112.3 });
      t.spans.push({ name: "b", start: 100, end: 108.7 });
      specimen.expect(t.timing).toBe("a;dur=12.3, b;dur=8.7");
    });

    specimen.it("timing skips unfinished spans", () => {
      const t = new Trace();
      t.spans.push({ name: "done", start: 0, end: 5 });
      t.spans.push({ name: "pending", start: 0 });
      specimen.expect(t.timing).toBe("done;dur=5.0");
    });

    specimen.it("timing is empty string when no completed spans", () => {
      const t = new Trace();
      specimen.expect(t.timing).toBe("");
    });
  });

  specimen.describe("trace middleware", () => {
    specimen.it("attaches ctx.trace and records total", async () => {
      const vector = new Vector();
      vector.use(trace());
      vector.open("ping", () => "pong");
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(res.headers.get("server-timing")).toBeTruthy();
      specimen.expect(res.headers.get("server-timing")).toContain("total;dur=");
    });

    specimen.it("uses provided name instead of total", async () => {
      const vector = new Vector();
      vector.use(trace("root"));
      vector.open("ping", () => "pong");
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.headers.get("server-timing")).toContain("root;dur=");
    });
  });

  specimen.describe("mark middleware", () => {
    specimen.it("adds named span within trace", async () => {
      const vector = new Vector();
      vector.use(trace());
      vector.use(mark("auth"));
      vector.open("ping", () => "pong");
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/ping"));
      const timing = res.headers.get("server-timing");
      specimen.expect(timing).toContain("total;dur=");
      specimen.expect(timing).toContain("auth;dur=");
    });

    specimen.it("multiple marks appear in order", async () => {
      const vector = new Vector();
      vector.use(trace());
      vector.use(mark("first"));
      vector.use(mark("second"));
      vector.open("ping", () => "pong");
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/ping"));
      const timing = res.headers.get("server-timing");
      specimen.expect(timing).toContain("first;dur=");
      specimen.expect(timing).toContain("second;dur=");
    });

    specimen.it("mark without trace is safe", async () => {
      const vector = new Vector();
      vector.use(mark("lonely"));
      vector.open("ping", () => "pong");
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(res.headers.get("server-timing")).toBe(null);
    });
  });

  specimen.describe("ad-hoc begin/end in effects", () => {
    specimen.it("effect can add spans to ctx.trace", async () => {
      const vector = new Vector();
      vector.use(trace());
      vector.open("work", async (ctx) => {
        ctx.trace.begin("query");
        await new Promise((r) => setTimeout(r, 5));
        ctx.trace.end("query");
        return "done";
      });
      const handler = http(vector);

      const res = await handler(new Request("http://localhost/work"));
      const timing = res.headers.get("server-timing");
      specimen.expect(timing).toContain("total;dur=");
      specimen.expect(timing).toContain("query;dur=");
    });
  });

  specimen.describe("branch-level marks", () => {
    specimen.it("mark on branch only traces that subtree", async () => {
      const app = new Aperture();
      app.use(trace());

      const api = app.branch("api");
      api.use(mark("api"));
      api.open("data", () => "api-data");

      app.open("root", () => "root-data");

      const handler = http(app);

      const apiRes = await handler(new Request("http://localhost/api/data"));
      specimen.expect(apiRes.headers.get("server-timing")).toContain("api;dur=");

      const rootRes = await handler(new Request("http://localhost/root"));
      specimen.expect(rootRes.headers.get("server-timing")).not.toContain("api;dur=");
    });
  });
});
