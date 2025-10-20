import { assertEquals } from "$std@std@std/assert";
import {
  Text,
  Token,
  generateTestParagraph,
  createTestContext,
  createTestClassifier,
} from "./lib.ts";

Deno.test("Single Sentence Classification", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  const sentenceText = "word1 word2 word3 word4 word5";
  const signal = new Text(sentenceText);
  const features = await classifier.parse(signal, testContext);

  assertEquals(
    features.length,
    5,
    "Should produce exactly 5 features (one per word)",
  );

  features.forEach((feature) => {
    assertEquals(
      typeof feature.token.word,
      "string",
      "Feature token should be a string",
    );
    assertEquals(
      typeof feature.annotation,
      "object",
      "Feature annotation should be an object",
    );

    assertEquals(
      features[0].hooked,
      undefined,
      "feature hooks only on factory",
    );
    assertEquals(
      feature.annotation.level,
      "token",
      "Feature should be annotated as level token",
    );
  });
});

Deno.test("Factory classificationn", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  assertEquals(classifier.hooks.length, 1, "should have feature hooks");

  const sentenceText = "word1 word2 word3 word4 word5";
  const features = await classifier.factory(testContext).text(sentenceText);

  assertEquals(features[0].hooked, true, "should call feature hook");

  assertEquals(
    features.length,
    5,
    "Should produce exactly 5 features (one per word)",
  );
});

Deno.test("Simple Paragraph Classification", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  const testParagraph = generateTestParagraph(3, 4);
  const signal = new Text(testParagraph);

  const features = await classifier.parse(signal, testContext);

  assertEquals(
    features.length,
    9,
    "Should produce exactly 12 features (3 sentences × 3 words)",
  );

  features.forEach((feature) => {
    assertEquals(
      typeof feature.token.word,
      "string",
      "Feature token should be a string",
    );
    assertEquals(
      typeof feature.annotation,
      "object",
      "Feature annotation should be an object",
    );
    assertEquals(
      feature.annotation.level,
      "token",
      "Feature should be at word level",
    );
  });
});

Deno.test("64 Features Classification Test", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  const testParagraph = generateTestParagraph(8, 8);
  const signal = new Text(testParagraph);

  const features = await classifier.parse(signal, testContext);

  assertEquals(
    features.length,
    64,
    "Should produce exactly 64 features (8 sentences × 8 words)",
  );

  features.forEach((feature) => {
    assertEquals(
      typeof feature.token.word,
      "string",
      "Feature token should be a string",
    );
    assertEquals(
      typeof feature.annotation,
      "object",
      "Feature annotation should be an object",
    );
    assertEquals(
      feature.annotation.level,
      "token",
      "Feature should be at word level",
    );
  });
});
