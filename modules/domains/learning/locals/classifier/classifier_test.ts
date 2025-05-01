import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { Classifier } from "./index.ts";
import { Feature, Context, Signal } from "./types.ts";

function splitParagraph(text: string): string[] {
  return text
    .split(".")
    .filter((s) => s.trim())
    .map((s) => s.trim());
}

function splitSentence(text: string): string[] {
  return text.split(" ").filter((w) => w.trim());
}

function createWordFeature(word: string): Feature {
  return {
    token: { word },
    annotation: { level: "word" },
  };
}

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

function createTestContext(): Context {
  return {
    utils: {
      splitParagraph,
      features: {
        fromAnalysis: (words: string[]) => words.map(createWordFeature),
      },
    },
    services: {
      stanza: async (sentence: string) => splitSentence(sentence),
    },
  };
}

// class Sentence extends Signal {
//   constructor(public readonly value: any) {
//     super(value, "sentence");
//   }
// }
// class Paragraph extends Signal {
//   constructor(public readonly value: any) {
//     super(value, "paragraph");
//   }
// }

Deno.test("64 Features Hypothesis", async () => {
  const testParagraph = generateTestParagraph(8, 8);
  console.log(`Test paragraph (excerpt): "${testParagraph.substring(0, 50)}..."`);

  const classifier = new Classifier(async (paragraph: string, ctx: Context, next) => {
    console.log(`Processing paragraph (${paragraph.length} chars)`);

    const sentences = ctx.utils.splitParagraph(paragraph);
    console.log(`Found ${sentences.length} sentences`);

    const features = await next(sentences);

    return features;
  }).branch(async (sentence: string, ctx: Context, next) => {
    console.log(`Processing sentence: "${sentence.substring(0, 20)}..."`);

    const analysis = await ctx.services.stanza(sentence);
    console.log(`Found ${analysis.length} words`);

    const features = ctx.utils.features.fromAnalysis(analysis);

    return features;
  });

  const signal = new Signal(testParagraph);
  console.log("signal ", signal);
  const ctx = createTestContext();
  const features = await classifier.parse(signal, ctx);

  console.log("classified feature like", features[0], `and ${features.length - 1} more like it.`);

  assertEquals(features.length, 64, "Should produce exactly 64 features (8 sentences × 8 words)");

  features.forEach((feature) => {
    assertEquals(typeof feature.token.word, "string", "Feature token should be a string");
    assertEquals(typeof feature.annotation, "object", "Feature annotation should be an object");
    assertEquals(feature.annotation.level, "word", "Feature should be at word level");
  });
});
