import { assertEquals } from "$std/assert";
import {
  Text,
  generateTestParagraph,
  createTestContext,
  createTestClassifier,
} from "./lib.ts";

const CONCURRENCY = 5;

Deno.test("Performance Improvement with Caching", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  const testParagraph = generateTestParagraph(8, 3);
  const signal = new Text(testParagraph);
  // console.log("signal", signal);

  console.log("First run (no cache):");
  const startTime1 = performance.now();
  const features1 = await classifier.parse(signal, testContext);
  // console.log("[FEATURES]");
  // console.log(features1);
  const endTime1 = performance.now();
  const duration1 = endTime1 - startTime1;
  console.log(`Duration: ${duration1.toFixed(2)}ms`);
  // console.log("[CLASSIFIER]");
  // console.log(classifier);

  console.log("\nSecond run (with cache):");
  const startTime2 = performance.now();
  const features2 = await classifier.parse(signal, testContext);
  const endTime2 = performance.now();
  const duration2 = endTime2 - startTime2;
  console.log(`Duration: ${duration2.toFixed(2)}ms`);
  // console.log("features2[0]", features2[0]);

  assertEquals(
    features1.length,
    features2.length,
    "Both runs should produce the same number of features",
  );

  const improvementFactor = duration1 / duration2;
  console.log(
    `\nPerformance improvement: ${improvementFactor.toFixed(2)}x faster`,
  );

  assertEquals(
    improvementFactor > 2,
    true,
    `Second run should be at least 2x faster with caching (actual: ${improvementFactor.toFixed(2)}x)`,
  );
});

Deno.test("Promise Resolution for Concurrent Processing", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();

  const testParagraph = generateTestParagraph(8, 3);
  const signal = new Text(testParagraph);
  // console.log("[signal]");
  // console.log(signal);
  await classifier.parse(signal, testContext);

  console.log(
    `Starting ${CONCURRENCY} concurrent parse operations on the same signal`,
  );
  const startTime = performance.now();

  const promises = Array(CONCURRENCY)
    .fill(null)
    .map(() => classifier.parse(signal, testContext));
  const results = await Promise.all(promises);
  // console.log("[feature]");
  // console.log(results[0][0]);

  const endTime = performance.now();
  const totalDuration = endTime - startTime;

  console.log(
    `${CONCURRENCY} concurrent operations completed in: ${totalDuration.toFixed(2)}ms`,
  );
  console.log(
    `Average time per operation: ${(totalDuration / CONCURRENCY).toFixed(2)}ms`,
  );

  results.forEach((result, i) => {
    assertEquals(result.length, 64, `Result ${i} should have 64 features`);
  });
});

Deno.test("Promise Resolution for Sequential Processing", async () => {
  const classifier = createTestClassifier();
  const testContext = createTestContext();
  const SEQUENCES = 5;
  // const classifications = [];
  // const information = new Set();

  console.log(`\nRunning ${SEQUENCES} sequential operations for comparison`);

  const seqStartTime = performance.now();
  let interval = performance.now();

  for (let i = 0; i < SEQUENCES; i++) {
    const signal = new Text(generateTestParagraph(12, 3));
    const features = await classifier.parse(signal, testContext);
    // classifications.push(features);
    // const words = new Set(features.map((feature) => feature.token.word));
    // for (const bit of words) {information.add(bit);}

    console.log(
      `[(interval)] (${(performance.now() - interval).toFixed(2)}ms)`,
    );
    // [total] ${(performance.now() - seqStartTime).toFixed(2)}ms
    // const speed = parseInt((performance.now() - interval).toFixed());
    // console.log(" ");
    // console.log(
    //   `[new]${words.size.toFixed()}`,
    //   `${(words.size / information.size).toFixed(2)}%`,
    //   `[total]${information.size.toFixed()}  _`,
    // );

    // ok fuck it.
    // i am trying to figure out effective the caching is over random distributions.
    // i am having fun.
    // i will not stop having fun.
    // i wanted to apply the classifier in my ontology.

    // console.log(
    //   `${speed.toFixed(2)}ms`,
    //   "     |",
    //   Array(Math.ceil(speed / 100))
    //     .fill("*")
    //     .join(""),
    // );

    interval = performance.now();
  }

  const total = performance.now() - seqStartTime;

  console.log(
    `${SEQUENCES} sequential operations completed in: ${total.toFixed(2)}ms`,
  );
  console.log(
    `Average time per sequential operation: ${(total / SEQUENCES).toFixed(2)}ms`,
  );

  // console.log(`\nEfficiency ratio: ${(seqDuration / totalDuration).toFixed(2)}`);
});
