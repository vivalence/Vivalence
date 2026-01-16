import { assertEquals } from "$std/assert";
import { Classifier, Signal, Feature, Parser } from "../classifier/index.js";

class Text extends Signal {
  constructor(value) {
    super("text", value);
  }
}

class Token extends Signal {
  forms = [Text];
  constructor(value) {
    super("token", value);
  }
}

function createContext() {
  return {
    tokenize: (text) =>
      text
        .split(" ")
        .filter((s) => s.trim())
        .map((s) => new Token(s.trim())),
    feature: (word) =>
      new Feature({ token: { word }, annotation: { level: "token" } }),
  };
}

Deno.test("basic classification", async () => {
  const classifier = new Classifier();
  const ctx = createContext();

  classifier
    .on(Text, async (text, ctx, forward) => {
      const tokens = ctx.tokenize(text);
      return forward(tokens);
    })
    .on(Token, async (token, ctx) => {
      return ctx.feature(token);
    });

  const features = await classifier.parse(new Text("hello world test"), ctx);

  assertEquals(features.length, 3);
  assertEquals(features[0].token.word, "hello");
  assertEquals(features[1].token.word, "world");
  assertEquals(features[2].token.word, "test");
});

Deno.test("caching works", async () => {
  const classifier = new Classifier();
  let callCount = 0;

  classifier.on(Text, async (text, ctx, forward) => {
    callCount++;
    return [new Feature({ token: { text } })];
  });

  const signal = new Text("cached");
  await classifier.parse(signal, {});
  await classifier.parse(signal, {});

  assertEquals(
    callCount,
    1,
    "parser should only be called once due to caching",
  );
});
