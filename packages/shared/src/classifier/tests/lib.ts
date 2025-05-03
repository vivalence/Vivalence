import { sleep, random } from "@vivalence/shared";
import { assertEquals } from "$std/assert";
import { Classifier } from "../index.ts";
import { Feature, type Context, Signal, Parser } from "../types.ts";

export class Text extends Signal<string> {
  constructor(value: string) {
    super("text", value);
  }
}

export class Token extends Signal<string> {
  generators = [Text];
  constructor(value: string) {
    super("token", value);
  }
}

export function generateTestParagraph(
  sentenceCount: number,
  tokenspacedepth: number,
): string {
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

export function createTestContext(): Context {
  return {
    signals: {
      token: async (text: string) => {
        return text.split(".").map((sentence) =>
          sentence
            .split(" ")
            .filter((s) => s.trim())
            .map((s) => s.trim())
            .map((s) => new Token(s)),
        );
      },
    },
    features: {
      token: async (word: string) => {
        const token = { word };
        const annotation = { level: "token" };
        return new Feature({ token, annotation });
      },
    },
  };
}

export function createTestClassifier(): Classifier {
  const classifier = new Classifier(Text, Token);

  classifier.on
    .text(async (text: string, ctx: Context, next): Feature[] => {
      const features = [];
      const tokens = (await ctx.signals.token(text)).flat();
      (await next(tokens)).flat().map((f) => features.push(f));
      return features;
    })
    .token(async (token: string, ctx: Context, next): Feature[] => {
      const features = await ctx.features.token(token);
      return features;
    });

  return classifier;
}

// features.push(new Feature({token: { paragraph }, annotation: { level: "paragraph" },}),);
