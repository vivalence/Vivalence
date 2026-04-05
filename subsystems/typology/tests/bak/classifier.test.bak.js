import { Classifier, Classifiable, Feature } from "@vivalence/typology";

class Text extends Classifiable {
  constructor(value) {
    super("text", value);
  }
}

class Token extends Classifiable {
  constructor(value) {
    super("token", value);
  }
}

function generateParagraph(sentences, wordLen) {
  const result = [];
  for (let i = 0; i < sentences; i++) {
    const words = [];
    for (let j = 0; j < sentences; j++) {
      words.push(
        Math.random()
          .toString(36)
          .substring(2, 2 + wordLen),
      );
    }
    result.push(words.join(" "));
  }
  return result.join(". ") + ".";
}

function createContext() {
  return {
    tokenize: (text) =>
      text
        .split(".")
        .flatMap((s) =>
          s
            .split(" ")
            .map((w) => w.trim())
            .filter(Boolean),
        )
        .map((w) => new Token(w)),
    featurize: (word) =>
      new Feature({ token: { word }, annotation: { level: "token" } }),
  };
}

function createClassifier() {
  return new Classifier()
    .on(Feature, (f, ctx) => {
      f.hooked = true;
      return f;
    })
    .on(Text, async (text, ctx, forward) => forward(ctx.tokenize(text)))
    .on(Token, async (token, ctx) => ctx.featurize(token));
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    console.error(`✗ ${name}:`, e.message);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Tests
await test("Single Sentence Classification", async () => {
  const classifier = createClassifier();
  const ctx = createContext();
  const features = await classifier.parse(new Text("a b c d e"), ctx);
  assert(features.length === 5, `Expected 5, got ${features.length}`);
  assert(features[0].hooked === undefined, "Hooks only on factory");
});

await test("Factory with hooks", async () => {
  const classifier = createClassifier();
  const ctx = createContext();
  const features = await classifier.factory(ctx).text("a b c d e");
  assert(features.length === 5, `Expected 5, got ${features.length}`);
  assert(features[0].hooked === true, "Should apply hooks");
});

await test("Paragraph Classification", async () => {
  const classifier = createClassifier();
  const ctx = createContext();
  const features = await classifier.parse(
    new Text(generateParagraph(3, 4)),
    ctx,
  );
  assert(features.length === 9, `Expected 9, got ${features.length}`);
});

await test("Caching Performance", async () => {
  const classifier = createClassifier();
  const ctx = createContext();
  const classifiable = new Text(generateParagraph(8, 3));

  const t1 = performance.now();
  await classifier.parse(classifiable, ctx);
  const d1 = performance.now() - t1;

  const t2 = performance.now();
  await classifier.parse(classifiable, ctx);
  const d2 = performance.now() - t2;

  console.log(`  First: ${d1.toFixed(2)}ms, Cached: ${d2.toFixed(2)}ms`);
  assert(d1 / d2 > 2, "Cached should be 2x faster");
});

await test("Concurrent Processing", async () => {
  const classifier = createClassifier();
  const ctx = createContext();
  const classifiable = new Text(generateParagraph(8, 3));
  await classifier.parse(classifiable, ctx);

  const t = performance.now();
  const results = await Promise.all(
    Array(5)
      .fill()
      .map(() => classifier.parse(classifiable, ctx)),
  );
  console.log(`  5 concurrent: ${(performance.now() - t).toFixed(2)}ms`);
  assert(
    results.every((r) => r.length === 64),
    "All should have 64 features",
  );
});

console.log("\nAll tests completed");
