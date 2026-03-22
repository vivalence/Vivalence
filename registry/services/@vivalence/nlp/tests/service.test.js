import { specimen, Url, Connection } from "@vivalence/typology";

const PORT = 5555;
const nlp = new Connection(new Url(`http://localhost:${PORT}`));

function tokenize(text, language = "es", processors = "tokenize,mwt,pos,lemma,depparse") {
  return nlp.call("/tokenize", { language, text, processors });
}

specimen.describe("nlp/service", () => {
  specimen.describe("tokenize", () => {
    specimen.it("returns tokens with dependency parse fields", async () => {
      const result = await tokenize("María se mira en el espejo");
      const tokens = result.sentences[0].tokens;

      specimen.expect(tokens.length).toBe(6);

      for (const token of tokens) {
        specimen.expect(typeof token.index).toBe("number");
        specimen.expect(typeof token.token).toBe("string");
        specimen.expect(typeof token.lemma).toBe("string");
        specimen.expect(typeof token.upos).toBe("string");
        specimen.expect(typeof token.head).toBe("number");
        specimen.expect(typeof token.deprel).toBe("string");
        specimen.expect(typeof token.start_char).toBe("number");
        specimen.expect(typeof token.end_char).toBe("number");
      }
    });

    specimen.it("identifies root correctly", async () => {
      const result = await tokenize("María se mira en el espejo");
      const tokens = result.sentences[0].tokens;
      const root = tokens.find((t) => t.deprel === "root");

      specimen.expect(root).toBeDefined();
      specimen.expect(root.token).toBe("mira");
      specimen.expect(root.head).toBe(0);
    });

    specimen.it("lemmatizes verbs", async () => {
      const result = await tokenize("María se mira en el espejo");
      const verb = result.sentences[0].tokens.find((t) => t.upos === "VERB");

      specimen.expect(verb.lemma).toBe("mirar");
    });

    specimen.it("handles multi-sentence input", async () => {
      const result = await tokenize("Hola mundo. ¿Cómo estás?");

      specimen.expect(result.sentences.length).toBe(2);
      specimen.expect(result.sentences[0].tokens.length).toBeGreaterThan(0);
      specimen.expect(result.sentences[1].tokens.length).toBeGreaterThan(0);
    });

    specimen.it("returns feats for inflected words", async () => {
      const result = await tokenize("María se mira en el espejo");
      const det = result.sentences[0].tokens.find((t) => t.upos === "DET");

      specimen.expect(det.token).toBe("el");
      specimen.expect(typeof det.feats).toBe("string");
      specimen.expect(det.feats).toContain("Definite=Def");
    });
  });

  specimen.describe("pt/brazilian", () => {
    function tokenizePt(text, processors = "tokenize,mwt,pos,lemma,depparse") {
      return nlp.call("/tokenize", { language: "pt", text, processors });
    }

    specimen.it("returns all fields for simple sentence", async () => {
      const result = await tokenizePt("Quero água.");
      const tokens = result.sentences[0].tokens;

      specimen.expect(tokens.length).toBe(3);

      for (const token of tokens) {
        specimen.expect(typeof token.index).toBe("number");
        specimen.expect(typeof token.token).toBe("string");
        specimen.expect(typeof token.upos).toBe("string");
        specimen.expect(typeof token.head).toBe("number");
        specimen.expect(typeof token.deprel).toBe("string");
      }
    });

    specimen.it("identifies root verb", async () => {
      const result = await tokenizePt("Quero água.");
      const root = result.sentences[0].tokens.find((t) => t.deprel === "root");

      specimen.expect(root).toBeDefined();
      specimen.expect(root.token).toBe("Quero");
      specimen.expect(root.upos).toBe("VERB");
      specimen.expect(root.head).toBe(0);
    });

    specimen.it("lemmatizes regular conjugated verbs", async () => {
      const result = await tokenizePt("Quero água.");
      const verb = result.sentences[0].tokens.find((t) => t.upos === "VERB");

      specimen.expect(verb.token).toBe("Quero");
      specimen.expect(verb.lemma).toBe("querer");
    });

    specimen.it("lemmatizes ser/estar/dizer/ir-as-aux", async () => {
      const r1 = await tokenizePt("Eles são muito inteligentes.");
      specimen.expect(r1.sentences[0].tokens.find((t) => t.token === "são").lemma).toBe("ser");

      const r2 = await tokenizePt("Eu estou aprendendo português porque é bonito.");
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "estou").lemma).toBe("estar");
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "é").lemma).toBe("ser");

      const r3 = await tokenizePt("Ela disse que ia chover amanhã.");
      specimen.expect(r3.sentences[0].tokens.find((t) => t.token === "disse").lemma).toBe("dizer");
      specimen.expect(r3.sentences[0].tokens.find((t) => t.token === "ia").lemma).toBe("ir");
    });

    specimen.it("FAILS to lemmatize irregular past forms foram/fomos/vi", async () => {
      const r1 = await tokenizePt("Os meninos foram ao parque.");
      specimen.expect(r1.sentences[0].tokens.find((t) => t.token === "foram").lemma).toBe("foram");

      const r2 = await tokenizePt("Nós fomos ao cinema ontem.");
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "fomos").lemma).toBe("fomos");

      const r3 = await tokenizePt("Eu vi as crianças no parque.");
      specimen.expect(r3.sentences[0].tokens.find((t) => t.token === "vi").lemma).toBe("vi");
    });

    specimen.it("pronoun lemmas echo surface form with original casing", async () => {
      const result = await tokenizePt("Você tem que fazer imediatamente.");
      const voce = result.sentences[0].tokens.find((t) => t.token === "Você");
      specimen.expect(voce.upos).toBe("PRON");
      specimen.expect(voce.lemma).toBe("Você");

      const r2 = await tokenizePt("Eu gosto do café.");
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "Eu").lemma).toBe("Eu");
    });

    specimen.it("parses aux + verb periphrasis", async () => {
      const result = await tokenizePt("Você tem que fazer imediatamente.");
      const tokens = result.sentences[0].tokens;
      const root = tokens.find((t) => t.deprel === "root");
      const aux = tokens.find((t) => t.deprel === "aux");

      specimen.expect(root.token).toBe("fazer");
      specimen.expect(root.lemma).toBe("fazer");
      specimen.expect(aux.token).toBe("tem");
      specimen.expect(aux.lemma).toBe("ter");
      specimen.expect(aux.head).toBe(root.index);
    });

    specimen.it("character offsets slice back to token text on non-mwt tokens", async () => {
      const text = "Quero água.";
      const result = await tokenizePt(text);
      const tokens = result.sentences[0].tokens;

      for (const token of tokens) {
        if (token.start_char !== null) {
          specimen.expect(text.slice(token.start_char, token.end_char)).toBe(token.token);
        }
      }
    });

    specimen.it("mwt-expanded tokens have null char offsets", async () => {
      const result = await tokenizePt("Eu gosto do café.");
      const tokens = result.sentences[0].tokens;
      const de = tokens.find((t) => t.token === "de");
      const o = tokens.find((t) => t.token === "o");

      specimen.expect(de.start_char).toBe(null);
      specimen.expect(de.end_char).toBe(null);
      specimen.expect(o.start_char).toBe(null);
      specimen.expect(o.end_char).toBe(null);
    });

    specimen.it("expands contractions do/na/ao via mwt", async () => {
      const r1 = await tokenizePt("Eu gosto do café.");
      specimen.expect(r1.sentences[0].tokens.find((t) => t.token === "de").upos).toBe("ADP");
      specimen.expect(r1.sentences[0].tokens.find((t) => t.token === "o").upos).toBe("DET");

      const r2 = await tokenizePt("Ela não gosta de comer na rua.");
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "em")).toBeDefined();
      specimen.expect(r2.sentences[0].tokens.find((t) => t.token === "a" && t.upos === "DET")).toBeDefined();

      const r3 = await tokenizePt("Os meninos foram ao parque.");
      specimen.expect(r3.sentences[0].tokens.find((t) => t.token === "a" && t.upos === "ADP")).toBeDefined();
      specimen.expect(r3.sentences[0].tokens.find((t) => t.token === "o" && t.upos === "DET")).toBeDefined();
    });

    specimen.it("mwt-expanded DET tokens carry feats", async () => {
      const result = await tokenizePt("Eu gosto do café.");
      const det = result.sentences[0].tokens.find((t) => t.token === "o" && t.upos === "DET");

      specimen.expect(typeof det.feats).toBe("string");
      specimen.expect(det.feats).toContain("Definite=Def");
      specimen.expect(det.feats).toContain("Gender=Masc");
    });

    specimen.it("não carries Polarity=Neg feat", async () => {
      const result = await tokenizePt("Ela não gosta de comer na rua.");
      const nao = result.sentences[0].tokens.find((t) => t.token === "não");

      specimen.expect(nao.feats).toBe("Polarity=Neg");
    });

    specimen.it("verb tokens have null feats", async () => {
      const result = await tokenizePt("Quero água.");
      specimen.expect(result.sentences[0].tokens.find((t) => t.upos === "VERB").feats).toBe(null);
    });

    specimen.it("xpos can be null", async () => {
      const result = await tokenizePt("Quero água.");
      specimen.expect(result.sentences[0].tokens.find((t) => t.token === "água").xpos).toBe(null);
    });

    specimen.it("handles multi-sentence input", async () => {
      const result = await tokenizePt("Quero água. Tudo depende de dinheiro.");

      specimen.expect(result.sentences.length).toBe(2);
      specimen.expect(result.sentences[0].tokens.length).toBe(3);
      specimen.expect(result.sentences[1].tokens[0].token).toBe("Tudo");
    });

    specimen.it("covers broad upos tag range", async () => {
      const result = await tokenizePt("Por favor, você poderia falar um pouco mais devagar?");
      const tags = new Set(result.sentences[0].tokens.map((t) => t.upos));

      specimen.expect(tags.has("VERB")).toBe(true);
      specimen.expect(tags.has("PRON")).toBe(true);
      specimen.expect(tags.has("AUX")).toBe(true);
      specimen.expect(tags.has("ADV")).toBe(true);
      specimen.expect(tags.has("NOUN")).toBe(true);
      specimen.expect(tags.has("ADP")).toBe(true);
      specimen.expect(tags.has("DET")).toBe(true);
    });

    specimen.it("dependency tree has exactly one root and valid head refs", async () => {
      const result = await tokenizePt("Quero água.");
      const tokens = result.sentences[0].tokens;

      let rootCount = 0;
      for (const token of tokens) {
        if (token.head === 0) rootCount++;
        else specimen.expect(tokens.find((t) => t.index === token.head)).toBeDefined();
      }
      specimen.expect(rootCount).toBe(1);
    });

    specimen.it("obj depends on root in simple transitive", async () => {
      const result = await tokenizePt("Quero água.");
      const obj = result.sentences[0].tokens.find((t) => t.deprel === "obj");

      specimen.expect(obj.token).toBe("água");
      specimen.expect(obj.head).toBe(1);
    });

    specimen.it("tokenizer can eat punctuation into token", async () => {
      const result = await tokenizePt("Ela disse que ia chover amanhã.");
      const last_content = result.sentences[0].tokens.find((t) => t.token.includes("amanhã"));

      specimen.expect(last_content.token).toBe("amanhã.");
      specimen.expect(last_content.lemma).toBe("amanhã.");
    });
  });
});
