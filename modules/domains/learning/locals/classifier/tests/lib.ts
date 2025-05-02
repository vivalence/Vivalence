import { sleep, random } from "@vivalence/shared";
import { assertEquals } from "$std/assert";
import { Classifier } from "../index.ts";
import { Feature, Context, Signal, Parser } from "../types.ts";

// Signal types - these are already defined in the test file, but we'll move them here
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

// Test paragraph generator
export function generateTestParagraph(sentenceCount: number, tokenspacedepth: number): string {
  const sentences = [];

  for (let i = 0; i < sentenceCount; i++) {
    const words = [];
    for (let j = 0; j < sentenceCount; j++) {
      words.push(
        `${Math.random()
          .toString(36)
          .substring(2, 2 + tokenspacedepth)}`,
      );
    }
    sentences.push(words.join(" "));
  }

  return sentences.join(". ") + ".";
}

// Create a test context
export function createTestContext(): Context {
  return {
    signals: {
      fromParagraph: async (paragraph: string) => {
        // await sleep(random.number(1, 10) / 10);
        return paragraph
          .split(".")
          .filter((s) => s.trim())
          .map((s) => s.trim())
          .map((s) => new Sentence(s));
      },
    },
    features: {
      fromStanza: async (words: Word[]) =>
        await Promise.all(
          words.map(async (word: Word): Feature => {
            // await sleep(random.number(1, 10) / 10);
            const token = { word: word.value };
            const annotation = { level: "word" };
            return new Feature({ token, annotation });
          }),
        ),
    },
    services: {
      stanza: async (sentence: string) => {
        // await sleep(random.number(1, 10) / 10);
        return sentence
          .split(" ")
          .filter((w) => w.trim())
          .map((w) => new Word(w));
      },
    },
  };
}

// Set up a classifier with standard parsers
export function createTestClassifier(): Classifier {
  const classifier = new Classifier();

  classifier.on(Paragraph, async (paragraph: Paragraph.value, ctx: Context, next): Feature[] => {
    const features = [];
    const signals = await ctx.signals.fromParagraph(paragraph);
    (await next(signals)).flat().map((f) => features.push(f));
    return features;
  });

  classifier.on(Sentence, async (sentence: string, ctx: Context, next): Feature[] => {
    const analysis = await ctx.services.stanza(sentence);
    const features = await ctx.features.fromStanza(analysis);
    return features;
  });

  return classifier;
}

// features.push(new Feature({token: { paragraph }, annotation: { level: "paragraph" },}),);
