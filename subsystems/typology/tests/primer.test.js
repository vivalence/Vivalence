import { is, shape, specimen, Vector } from "@vivalence/typology";

const guides = () =>
  new Vector()
    .open({ nature: "render", valence: "How to draw" }, "RENDER")
    .open({ nature: "style", load: "eager" }, async () => "STYLE");

const nested = () =>
  new Vector()
    .open("hello", "HELLO")
    .open("machine", (ctx) => `machine ${ctx.slug}`)
    .open({ nature: "guides", load: "lazy" }, guides());

specimen.describe("Primer — a Vector of text effects", () => {
  specimen.it("P0: a Primer is a Vector; an effect is a string, a function, or a Primer grafted at its nature", async () => {
    const primer = nested();
    specimen.expect(is.Vector(primer)).toBe(true);
    specimen.expect(await shape.primer.load(primer, { slug: "demo" })).toEqual({
      hello: "HELLO",
      machine: "machine demo",
      primer: "Read on demand with primer_read { nature }:\nguides/render — How to draw",
      "guides/style": "STYLE",
    });
  });

  specimen.it("P1: load defaults eager; lazy on a branch reaches every effect under it; the nearest declared wins", () => {
    specimen.expect(shape.primer.keys(nested())).toEqual(["hello", "machine", "guides/style"]);
    specimen.expect(shape.primer.lazy(nested()).map((node) => node.nature)).toEqual(["guides/render"]);
  });

  specimen.it("P2: a lazy effect reads on demand, with the reader's context; an unknown nature throws", async () => {
    const primer = nested();
    specimen.expect(await shape.primer.read(primer, "guides/render", {})).toBe("RENDER");
    specimen.expect(await shape.primer.read(primer, "/machine", { slug: "late" })).toBe("machine late");
    await specimen.expect(shape.primer.read(primer, "guides/nope", {})).rejects.toThrow("[primer] no node at 'guides/nope'");
  });

  specimen.it("P3: an effect giving null is absent; anything but a string, null or a Primer throws; no lazy node, no index", async () => {
    specimen.expect(await shape.primer.load(new Vector().open("a", "A").open("b", () => null))).toEqual({ a: "A" });
    await specimen.expect(shape.primer.load(new Vector().open("c", () => 7))).rejects.toThrow("[primer] 'c' gave number");
  });

  specimen.it("P4: a graft keeps the grafted pattern — a mode's lazy branch stays lazy on the hallucination's primer", async () => {
    const primer = new Vector().open("system", "SYSTEM").graft(nested());
    primer.open("thread", "THREAD");
    specimen.expect(Object.keys(await shape.primer.load(primer, { slug: "x" }))).toEqual([
      "system", "hello", "machine", "primer", "guides/style", "thread",
    ]);
  });

  specimen.it("P5: a Primer handed to open is copied in — opening under it never writes the source", async () => {
    const source = guides();
    const primer = new Vector();
    primer.branch("guides").graft(source);
    primer.open("guides/extra", "EXTRA");
    specimen.expect(shape.primer.keys(primer)).toEqual(["guides/render", "guides/style", "guides/extra"]);
    specimen.expect(shape.primer.keys(source)).toEqual(["render", "style"]);
  });

  specimen.it("P6: a function giving a Primer expands at load under its nature; read lists it, then reads into it", async () => {
    const primer = new Vector()
      .open("persona", () => guides())
      .open({ nature: "archivist", load: "lazy", valence: "the harvest persona" }, () => new Vector().open("ladder", "LADDER"));
    specimen.expect(await shape.primer.load(primer)).toEqual({
      "persona/render": "RENDER",
      "persona/style": "STYLE",
      primer: "Read on demand with primer_read { nature }:\narchivist — the harvest persona",
    });
    specimen.expect(await shape.primer.read(primer, "archivist")).toBe("archivist/ladder");
    specimen.expect(await shape.primer.read(primer, "archivist/ladder")).toBe("LADDER");
  });
});
