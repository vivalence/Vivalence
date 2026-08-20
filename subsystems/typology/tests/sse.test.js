import { specimen, sse } from "@vivalence/typology";

async function collect(readable) {
  const out = [];
  for await (const frame of sse.frames(readable)) out.push(frame);
  return out;
}

specimen.describe("belt.sse — frames ∘ encode = identity", () => {
  specimen.it("round-trips a packet stream through the wire form", async () => {
    const events = [
      { event: "/audio/packet", audio: "aGk=", rate: 16000 },
      { event: "/turn/close" },
      "plain",
    ];
    specimen.expect(await collect(sse.encode(events))).toEqual(events);
  });

  specimen.it("reassembles frames split across chunk boundaries", async () => {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"a":1}\n\ndata: {"b":'));
        controller.enqueue(encoder.encode("2}\n\n"));
        controller.close();
      },
    });
    specimen.expect(await collect(readable)).toEqual([{ a: 1 }, { b: 2 }]);
  });
});
