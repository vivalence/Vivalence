import { specimen, v, Vector, Connection, Url, shape } from "@vivalence/typology";

const Frame = v.object({ event: v.const("/audio/packet"), audio: v.string(), rate: v.integer() });
const Event = v.object({ event: v.string() });

specimen.describe("strip ⟷ wire — an upstream leaf compiles to converse", () => {
  const aperture = new Vector()
    .open({ nature: "/verbatim/stream", feeds: Frame, yields: Event }, () => null)
    .open({ nature: "/dialogue/stream", yields: Event }, () => null)
    .open("/dialogue/render", () => null);

  specimen.it("strip carries feeds beside yields", () => {
    const stripped = shape.strip(aperture);
    specimen.expect(stripped.branches.verbatim.branches.stream.effect.feeds).toBeDefined();
    specimen.expect(stripped.branches.verbatim.branches.stream.effect.yields).toBeDefined();
    specimen.expect(stripped.branches.dialogue.branches.stream.effect.feeds).toBeUndefined();
  });

  specimen.it("a feeds leaf calls converse with the source up and input beside; a yields leaf still streams", async () => {
    const calls = [];
    const transport = async (ctx) => {
      calls.push({
        path: ctx.request.url.pathname,
        accept: ctx.request.headers.get("accept"),
        input: ctx.request.body,
        upstream: ctx.request.raw?.body instanceof ReadableStream,
      });
      ctx.response.status = 200;
      ctx.response.body = (async function* () {
        yield { event: "/ok" };
      })();
    };
    const connection = new Connection(new Url("http://wire.test"), transport);
    const mirror = shape.connection.wire(connection, shape.strip(aperture));

    async function* source() {
      yield { event: "/audio/packet", audio: "aGk=", rate: 16000 };
    }
    const down = [];
    for await (const event of mirror.verbatim.stream(source(), { input: { thread: "t1" } })) down.push(event);
    specimen.expect(down).toEqual([{ event: "/ok" }]);
    specimen.expect(calls[0]).toEqual({ path: "/verbatim/stream", accept: "text/event-stream", input: { thread: "t1" }, upstream: true });

    for await (const _ of mirror.dialogue.stream({ thread: "t1" })) break;
    specimen.expect(calls[1]).toEqual({ path: "/dialogue/stream", accept: "text/event-stream", input: { thread: "t1" }, upstream: false });
  });

  specimen.it("plain HTTP refuses converse input loudly", async () => {
    const connection = new Connection(new Url("http://nowhere.test"));
    async function* source() {
      yield { event: "/audio/packet", audio: "aGk=", rate: 16000 };
    }
    let fault = null;
    try {
      for await (const _ of connection.converse("/x", source(), { input: { thread: "t1" } })) break;
    } catch (error) {
      fault = error;
    }
    specimen.expect(fault?.message ?? "").toContain("multiplex");
  });
});
