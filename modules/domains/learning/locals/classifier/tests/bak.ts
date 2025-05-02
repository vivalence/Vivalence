import { assertEquals } from "https://deno.land/std/assert/mod.ts";

import { Classifier } from "./index.ts";
import { Feature, Context, Signal } from "./types.ts";

function generateTestParagraph(sentenceCount: number, wordsPerSentence: number): string {
  const sentences = [];

  for (let i = 0; i < sentenceCount; i++) {
    const words = [];
    for (let j = 0; j < wordsPerSentence; j++) {
      words.push(`w${i}${j}${Math.random().toString(36).substring(2, 5)}`);
    }
    sentences.push(words.join(" "));
  }

  return sentences.join(". ") + ".";
}
export class Paragraph extends Signal<string> {
  constructor(value: string) {
    super("paragraph", value);
  }
}

export class Sentence extends Signal<string> {
  constructor(value: string) {
    super("sentence", value);
  }
}

export class Word extends Signal<string> {
  constructor(value: string) {
    super("word", value);
  }
}

function createTestContext(): Context {
  return {
    signals: {
      fromParagraph: async (paragraph: Paragraph) =>
        paragraph
          .split(".")
          .filter((s) => s.trim())
          .map((s) => s.trim())
          .map((s) => new Sentence(s)),
    },
    features: {
      fromStanza: async (words: string[]) =>
        words.map((word: string): Feature => {
          const token = { word };
          const annotation = { level: "word" };
          return new Feature({ token, annotation });
        }),
    },
    services: {
      stanza: async (sentence: string) =>
        sentence
          .split(" ")
          .filter((w) => w.trim())
          .map((w) => new Word(w)),
    },
  };
}

const classifier = new Classifier();

classifier.on(Paragraph, async (paragraph: string, ctx: Context, next) => {
  // so sentence.hash can currently not consider any content of the signal hash.
  // but i think i should think about wanting that.
  const sentences = ctx.signals.sentence.fromParagraph(paragraph);
  const features: [Feature[]] = await next(sentences);
  return features.flat();
});

classifier.on(Sentence, async (sentence: Signal, ctx: Context, next) => {
  const analysis = await ctx.services.stanza(sentence);
  const features = ctx.features.fromStanza(analysis);
  return features;
});

Deno.test("64 Features Hypothesis", async () => {
  const testParagraph = generateTestParagraph(8, 8);
  // console.log(`Test paragraph (excerpt): "${testParagraph.substring(0, 50)}..."`);

  const signal = new Paragraph(testParagraph);

  const features = await classifier.parse(signal, createTestContext());

  // console.log("classified feature like", features[0], `and ${features.length - 1} more like it.`);

  assertEquals(features.length, 64, "Should produce exactly 64 features (8 sentences × 8 words)");

  features.forEach((feature) => {
    assertEquals(typeof feature.token.word, "string", "Feature token should be a string");
    assertEquals(typeof feature.annotation, "object", "Feature annotation should be an object");
    assertEquals(feature.annotation.level, "word", "Feature should be at word level");
  });
});

Deno.test(
  "do 64 classifications and expect the time delte between the first and second to be above 10x and each further consistent at around 10%",
  async () => {
    const testParagraph = generateTestParagraph(8, 8);
    const signal = new Paragraph(testParagraph);

    // for 64 times
    const features = await classifier.parse(signal, createTestContext());

    // console.log("classified feature like", features[0], `and ${features.length - 1} more like it.`);

    assertEquals(features.length, 64, "Should produce exactly 64 features (8 sentences × 8 words)");

    features.forEach((feature) => {
      assertEquals(typeof feature.token.word, "string", "Feature token should be a string");
      assertEquals(typeof feature.annotation, "object", "Feature annotation should be an object");
      assertEquals(feature.annotation.level, "word", "Feature should be at word level");
    });
  },
);
